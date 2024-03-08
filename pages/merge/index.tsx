import React, { useRef, useState } from 'react';
import { useStorageUpload } from '@thirdweb-dev/react';

const MyComponent: React.FC = () => {
  const { mutateAsync: upload } = useStorageUpload();
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generatedImageFile, setGeneratedImageFile] = useState<File | null>(null);
  const [ipfsLink, setIpfsLink] = useState<string | null>(null);
  const[gen,setgen]=useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const imagePromises: Promise<HTMLImageElement>[] = [];

    // Load each selected file as an image
    files.forEach((file) => {
      const reader = new FileReader();
      const promise = new Promise<HTMLImageElement>((resolve, reject) => {
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = event.target.result;
          }
        };
        reader.readAsDataURL(file);
      });
      imagePromises.push(promise);
    });
  

    // Once all images are loaded, set them in the state
    Promise.all(imagePromises)
      .then((loadedImages) => {
        setImages(loadedImages);
      })
      .catch((error) => {
        console.error('Error loading images:', error);
      });
  };

  const generateImage = async () => {
    setgen(true);
    if (!canvasRef.current || images.length === 0) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let totalimgH = 0;
    let totalimgW = 0;
    let BeforeH = 0;
    let breaking = Math.ceil(images.length / 2);

    canvas.height, canvas.width = 0, 0;
    images.forEach((image, index) => {
      if (index < breaking) {
        canvas.width += image.width;
        canvas.height = Math.max(canvas.height, image.height);
        BeforeH = canvas.height;
      } else {
        totalimgH = 0;
        totalimgH = BeforeH + images[index].height;
        totalimgW += image.width;
        canvas.height = Math.max(totalimgH, canvas.height);
        canvas.width = Math.max(canvas.width, totalimgW);
      }
    });

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each image onto the canvas
    let offsetX = 0;
    let offsetY = 0;
    let rowsetX = 0;

    images.forEach((image, index) => {
      if (index < breaking) {
        ctx.drawImage(image, offsetX, 0, image.width, image.height);
        offsetX += image.width;
        offsetY = Math.max(offsetY, image.height);
      } else {
        ctx.drawImage(image, rowsetX, offsetY, image.width, image.height);
        rowsetX += image.width;
      }
    });
    
    // Convert canvas content to a Blob
    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'generated_image.png', { type: 'image/png' });
          resolve(file);
        } else {
          resolve(null);
        }
      });
    });
  };

  const handleDownload = async () => {
    if (generatedImageFile) {
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(generatedImageFile);
      downloadLink.download = 'generated_image.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleUploadToIPFS = async () => {
    if (generatedImageFile) {
      try {
        const ipfsUri = await upload({ data: [generatedImageFile] });
        setIpfsLink(ipfsUri[0]);
        console.log('Uploaded to IPFS:', ipfsUri[0]);
      } catch (error) {
        console.error('Error uploading to IPFS:', error);
      }
    }
  };

  const handleGenerateImage = async () => {
    const imageFile = await generateImage();
    if (imageFile) {
      setGeneratedImageFile(imageFile);
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
      <canvas ref={canvasRef}></canvas>
      {!gen?
      <>
       <button onClick={handleGenerateImage}>Generate Image</button>
       </>:
       <><button onClick={handleDownload}>Download Image</button>
       <button onClick={handleUploadToIPFS}>Upload to IPFS</button>
       <p>IPFS Link: {ipfsLink}</p>
       </>
}
      
    </div>
  );
};

export default MyComponent;
