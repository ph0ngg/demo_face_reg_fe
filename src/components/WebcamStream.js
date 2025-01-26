import React, { useEffect, useRef, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const WebcamStream = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const processingRef = useRef(false); // Theo dõi trạng thái xử lý

  // Khởi tạo webcam
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startWebcam();
    return () => {
      const currentVideoRef = videoRef.current; // Lưu giá trị của ref vào một biến cục bộ
      if (currentVideoRef && currentVideoRef.srcObject) {
        currentVideoRef.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Hàm xử lý một frame
  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || processingRef.current) return;

    processingRef.current = true; // Đánh dấu đang xử lý

    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const video = videoRef.current;

      // Đảm bảo video đã load
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        processingRef.current = false;
        return;
      }

      // Cập nhật kích thước canvas nếu cần
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Vẽ frame hiện tại vào canvas tạm thời
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const tempContext = tempCanvas.getContext('2d');
      tempContext.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

      // Chuyển frame thành blob và gửi đến server
      const sendFrame = () => {
        return new Promise((resolve, reject) => {
          tempCanvas.toBlob(async (blob) => {
            try {
              const formData = new FormData();
              formData.append('image', blob, 'frame.jpg');

              const response = await fetch(`${API_URL}/process_frame`, {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) throw new Error('Network response was not ok');

              const imageBlob = await response.blob();
              resolve(imageBlob);
            } catch (error) {
              reject(error);
            }
          }, 'image/jpeg', 0.8); // Có thể điều chỉnh chất lượng ảnh ở đây (0.8 = 80%)
        });
      };

      // Xử lý và hiển thị frame
      const processedBlob = await sendFrame();
      const imageUrl = URL.createObjectURL(processedBlob);
      const processedImage = new Image();

      processedImage.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(processedImage, 0, 0);
        URL.revokeObjectURL(imageUrl);
        processingRef.current = false; // Đánh dấu đã xử lý xong
      };

      processedImage.src = imageUrl;

    } catch (error) {
      console.error("Error processing frame:", error);
      processingRef.current = false;
    }
  };

  // Thiết lập loop xử lý frame
  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      processFrame();
      animationFrameId = requestAnimationFrame(animate);
    };

    if (stream) {
      animate();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [stream]);

  return (
    <div className="webcam-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          backgroundColor: '#000'
        }}
      />
      <div className="status-indicator"
        style={{
          color: processingRef.current ? '#ff0000' : '#00ff00',
          position: 'absolute',
          top: '10px',
          left: '10px'
        }}>
        {processingRef.current ? 'Processing...' : 'Ready'}
      </div>
    </div>
  );
};

export default WebcamStream;