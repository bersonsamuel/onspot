/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';

export default function CameraModal() {
  const { activeModal, closeModal, updateProfile, showToast } = useApp();

  const [statusText, setStatusText] = useState('Requesting camera access...');
  const [statusColor, setStatusColor] = useState('var(--text-primary)');
  const [guideBorderColor, setGuideBorderColor] = useState('rgba(255, 255, 255, 0.4)');
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopStream = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (activeModal === 'camera-modal') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCapturedImg(null);
       
      setIsFaceDetected(false);
       
      setStatusText('Position your face inside the guide');
       
      setStatusColor('var(--text-primary)');
       
      setGuideBorderColor('rgba(255, 255, 255, 0.4)');

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }

            let scanCount = 0;
            intervalRef.current = setInterval(() => {
              scanCount++;
              if (scanCount < 2) {
                setStatusText('Move slightly left');
                setGuideBorderColor('rgba(255, 255, 255, 0.4)');
              } else if (scanCount < 4) {
                setStatusText('Center your face');
              } else {
                setStatusText('Ready to capture');
                setStatusColor('var(--mint-primary)');
                setGuideBorderColor('var(--mint-primary)');
                setIsFaceDetected(true);
                if (intervalRef.current) clearInterval(intervalRef.current);
              }
            }, 800);
          })
          .catch((err) => {
            console.error(err);
            setStatusText('Camera permission denied or unavailable.');
          });
      } else {
        setStatusText('Camera not supported on this browser.');
      }
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [activeModal]);

  if (activeModal !== 'camera-modal') {
    return null;
  }

  const handleCapture = () => {
    if (!isFaceDetected) {
      showToast('No face detected yet.');
      return;
    }
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL('image/jpeg');
        setCapturedImg(url);
        stopStream();
        setStatusText('Captured successfully');
        setStatusColor('var(--text-primary)');
      }
    }
  };

  const handleRetake = () => {
    setCapturedImg(null);
    setIsFaceDetected(false);
    setStatusText('Position your face inside the guide');
    setStatusColor('var(--text-primary)');
    setGuideBorderColor('rgba(255, 255, 255, 0.4)');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          let scanCount = 0;
          intervalRef.current = setInterval(() => {
            scanCount++;
            if (scanCount < 2) {
              setStatusText('Move slightly left');
              setGuideBorderColor('rgba(255, 255, 255, 0.4)');
            } else if (scanCount < 4) {
              setStatusText('Center your face');
            } else {
              setStatusText('Ready to capture');
              setStatusColor('var(--mint-primary)');
              setGuideBorderColor('var(--mint-primary)');
              setIsFaceDetected(true);
              if (intervalRef.current) clearInterval(intervalRef.current);
            }
          }, 800);
        })
        .catch(() => {
          setStatusText('Camera unavailable.');
        });
    }
  };

  const handleUsePhoto = () => {
    if (capturedImg) {
      updateProfile({ avatarUrl: capturedImg });
      showToast('Profile photo updated!');
    }
    stopStream();
    closeModal('camera-modal');
  };

  const handleClose = () => {
    stopStream();
    closeModal('camera-modal');
  };

  return (
    <div
      className={`modal-overlay ${activeModal === 'camera-modal' ? 'open' : ''}`}
      id="camera-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal-card" style={{ textAlign: 'center' }}>
        <div className="modal-header">
          <h3>Set Profile Photo</h3>
          <button className="close-btn" aria-label="Close" onClick={handleClose}>
            ✕
          </button>
        </div>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '320px',
            margin: '0 auto 16px auto',
            aspectRatio: '3/4',
            background: '#000',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          <video
            ref={videoRef}
            id="camera-video"
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: capturedImg ? 'none' : 'block',
            }}
          />
          <canvas ref={canvasRef} id="camera-canvas" style={{ display: 'none' }} />
          {capturedImg && (
            <img
              src={capturedImg}
              id="camera-preview-img"
              alt="Captured"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {!capturedImg && (
            <div
              id="face-guide-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                border: `4px dashed ${guideBorderColor}`,
                borderRadius: '50%',
                width: '60%',
                height: '60%',
                top: '20%',
                left: '20%',
                transition: 'border-color 0.3s',
              }}
            />
          )}
        </div>
        <div
          id="camera-status-text"
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: statusColor,
            marginBottom: '16px',
          }}
        >
          {statusText}
        </div>
        {!capturedImg ? (
          <div id="camera-action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              className="btn-action-primary"
              id="btn-capture-photo"
              onClick={handleCapture}
              disabled={!isFaceDetected}
            >
              Capture Photo
            </button>
          </div>
        ) : (
          <div id="camera-confirm-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="btn-cancel" onClick={handleRetake}>
              Retake
            </button>
            <button className="btn-action-primary" onClick={handleUsePhoto}>
              Use Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
