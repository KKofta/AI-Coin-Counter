import * as React from 'react'
import {useState} from 'react'
import NavigationBar from "../components/NavigationBar";
import {uploadImageToStorage} from "../api/azure_storage_api/azureStorageApiCalls";
import {getPredictions, Prediction} from "../api/custom_vision_api/customVisionApiCalls";
import {Col, Row, Spinner} from "reactstrap";
import {FileUploadCard} from "../components/FileUploadCard";

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [pendingApiCall, setPendingApiCall] = useState<boolean>(false);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
    const [error, setError] = useState<string>('')

    const onFileChange = (event: any) => {
        setError('');
        setUploadedImageUrl('')
        setPredictions([]);
        setSelectedFile(null);

        if (event.target.files[0] === undefined) {
            setError('Any file was uploaded!');
            return;
        }

        const name = event.target.files[0].name;
        const lastDot = name.lastIndexOf('.');
        const ext = name.substring(lastDot + 1);

        if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
            setSelectedFile(event.target.files[0]);
        } else {
            setError('Unsupported file extension!');
            event.target.value = null;
        }
    };

    const onFileUpload = async () => {
        setError('');
        setPredictions([]);
        setUploadedImageUrl('');
        setPendingApiCall(true);
        setSelectedFile(null);

        if (!selectedFile) {
            setError('Any file was uploaded!');
            return;
        }

        uploadImageToStorage(selectedFile)
            .then(url => {
                setUploadedImageUrl(url);
                return getPredictions(url);
            }).then(response => {
            setPendingApiCall(false);
            setPredictions(response.data.predictions);
        }).catch(error => {
            setPendingApiCall(false);
            setError('Invalid image content!')
            console.error(error)
        });
    };

    const diseaseNameByTag: any = {
        'mel': 'melanoma',
        'nv': 'melanocytic nevus',
        'bcc': 'basall cell carcinoma',
        'df': 'dermatofibroma',
        'vasc': 'vascular lesion',
        'akiec': 'actinic keratosis / intraepithelial carcinoma',
        'bkl': 'benign keratosis'
    };

    return (
        <div className="mb-3">
            <NavigationBar/>
            <div className="container-lg">
                <FileUploadCard onFileChange={onFileChange} onFileUpload={onFileUpload}/>
                <div className="mt-2" style={{minHeight: "60vh"}}>
                    <Row>
                        {(pendingApiCall || (!pendingApiCall && !uploadedImageUrl) || error) &&
                        <Col className="col-12 d-flex flex-wrap align-items-center" style={{minHeight: "56vh"}}>
                            {pendingApiCall && !error && <div className="text-center mx-auto"><Spinner>
                                Loading...
                            </Spinner></div>}
                            {!pendingApiCall && !uploadedImageUrl && !error &&
                            <div className="text-muted text-center mx-auto">
                                Here you will see the predictions
                            </div>}
                            {error && <div className="text-danger text-center mx-auto">
                                {error}
                            </div>}
                        </Col>}
                        {(uploadedImageUrl && predictions.length > 0) && <Row>
                            <Col className="col-6 d-flex flex-wrap align-items-center" style={{minHeight: "56vh"}}>
                                {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                <img src={uploadedImageUrl} className="img-fluid mx-auto d-block" alt="Uploaded image"/>
                            </Col>
                            <Col className="col-6 align-self-center">
                                {predictions.length > 0 && <h4><p>Predictions:</p></h4>}
                                {predictions.map(p => (
                                    <div key={p.probability}>
                                        {p.probability >= 0.8 &&
                                        <p className="text-danger">{Math.round(p.probability * 10000) / 100}%
                                            - {diseaseNameByTag[p.tagName]} ({p.tagName})</p>}
                                        {p.probability < 0.8 && p.probability > 0.3 &&
                                        <p>{Math.round(p.probability * 10000) / 100}%
                                            - {diseaseNameByTag[p.tagName]} ({p.tagName})</p>}
                                        {p.probability <= 0.3 &&
                                        <p className="text-muted">{Math.round(p.probability * 10000) / 100}%
                                            - {diseaseNameByTag[p.tagName]} ({p.tagName})</p>}
                                    </div>
                                ))}
                            </Col>
                        </Row>}
                    </Row>
                </div>
            </div>
        </div>
    );
}

export default App;