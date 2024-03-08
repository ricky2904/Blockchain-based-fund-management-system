import React, { useRef, useState } from 'react';

interface FormData {
  projectName: string;
  stageNumber: string;
  amountRequested: string;
}

const MyComponent: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    stageNumber: '',
    amountRequested: '',
  });

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const generateImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 500;
    canvas.height = 500;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`Project Name: ${formData.projectName}`, 10, 50);
    ctx.fillText(`Stage Number: ${formData.stageNumber}`, 10, 100);
    ctx.fillText(`Amount Requested: ${formData.amountRequested}`, 10, 150);

    const pngImage = canvas.toDataURL('image/png');
    console.log('PNG Image:', pngImage);

    setGeneratedImage(pngImage);
  };

  return (
    <div>
      <form>
        <div>
          <label htmlFor="projectName">Project Name:</label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="stageNumber">Stage Number:</label>
          <input
            type="text"
            id="stageNumber"
            name="stageNumber"
            value={formData.stageNumber}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="amountRequested">Amount Requested:</label>
          <input
            type="text"
            id="amountRequested"
            name="amountRequested"
            value={formData.amountRequested}
            onChange={handleChange}
          />
        </div>
      </form>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <button onClick={generateImage}>Generate Image</button>
      {generatedImage && <img src={generatedImage} alt="Generated Image" />}
    </div>
  );
};

export default MyComponent;
