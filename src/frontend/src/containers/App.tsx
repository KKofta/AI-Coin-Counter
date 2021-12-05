import * as React from 'react'
import {useState} from 'react'
import NavigationBar from "../components/NavigationBar";
import {uploadImageToStorage} from "../api/azure_storage_api/azureStorageApiCalls";
import {getPredictions, Prediction} from "../api/custom_vision_api/customVisionApiCalls";
import {Col, Row, Spinner} from "reactstrap";
import {FileUploadCard} from "../components/FileUploadCard";
import Canvas from "../components/Canvas";

export const minProbability = 0.75;

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [pendingApiCall, setPendingApiCall] = useState<boolean>(false);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
    const [error, setError] = useState<string>('')
    // const [imgEl, setImgEl] = useState<any>(null)

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

                        <Col className="align-self-center mb-3">
                            {predictions.length > 0 && <h4><p>Predictions:</p></h4>}
                            {predictions.map(p => (
                                p.probability > minProbability && (<div key={p.probability}>
                                    Found {p.tagName} zł<br/>
                                </div>)
                            ))}
                            {predictions.length > 0 &&
                            <div>
                                Sum: {predictions.filter(a => a.probability > minProbability).reduce((sum, {tagName}: { tagName: string }) => sum + parseFloat(tagName), 0)}
                            </div>}
                        </Col>
                        {(uploadedImageUrl && predictions.length > 0) && <Row>
                            <Col style={{minHeight: "56vh"}}>
                                {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                {/*<img src={uploadedImageUrl} className="img-fluid mx-auto d-block" alt="Uploaded image"*/}
                                {/*     ref={el => setImgEl(el)}/>*/}
                                <Canvas uploadedImageUrl={uploadedImageUrl} predictions={predictions} width="700"
                                        height="700" minProbability={minProbability}/>
                            </Col>
                        </Row>}
                    </Row>
                </div>
            </div>
        </div>
    );
}

export default App;