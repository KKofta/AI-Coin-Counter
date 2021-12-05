import React, {useEffect, useRef} from 'react'

const Canvas = (props: any) => {

    const canvasRef = useRef(null)

    useEffect(() => {

            const canvas = canvasRef.current
            // @ts-ignore
            const context = canvas.getContext('2d')

            let img = new Image();
            img.onload = function () {

                let l = 1;
                if (img.width > img.height){
                    l = (parseFloat(props.width) / img.width);
                } else{
                    l = (parseFloat(props.height) / img.height);
                }

                context.drawImage(img, 0, 0, img.width * l, img.height * l);

                for (const p of props.predictions) {
                    if (p.probability > props.minProbability) {
                        let x = (p.boundingBox.left * img.width) * l;
                        let y = (p.boundingBox.top * img.height) * l;
                        let width = (p.boundingBox.width * img.width) * l;
                        let height = (p.boundingBox.height * img.height) * l;

                        if (p.tagName === "1zl"){
                            context.strokeStyle = "green"
                        } else if (p.tagName === "2zl"){
                            context.strokeStyle = "red"
                        } else if (p.tagName === "5zl"){
                            context.strokeStyle = "blue"
                        }
                        context.beginPath()
                        context.rect(x, y, width, height)
                        context.stroke()
                    }
                }
            }
            img.src = props.uploadedImageUrl;

        }
    )

    return <canvas ref={canvasRef} width={props.width} height={props.height}/>
}

export default Canvas