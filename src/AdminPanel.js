import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { useImage } from 'react-konva-utils';

const AdminPanel = () => {
    const [defaultTemplate, setDefaultTemplate] = useState(localStorage.getItem('defaultCardTemplate') || null);
    const [image] = useImage(defaultTemplate);
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

    const handleTemplateUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setDefaultTemplate(reader.result);
                localStorage.setItem('defaultCardTemplate', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (image) {
            const img = new window.Image();
            img.src = defaultTemplate;

            img.onload = () => {
                const imgWidth = img.width;
                const imgHeight = img.height;
                setImageDimensions({ width: imgWidth, height: imgHeight });

                const scaleWidth = dimensions.width / imgWidth;
                const scaleHeight = (dimensions.height - 104) / imgHeight;
                const minScale = Math.min(scaleWidth, scaleHeight);
                setScale(minScale);

                setOffset({
                    x: (dimensions.width - imgWidth * minScale) / 2,
                    y: (dimensions.height - 104 - imgHeight * minScale) / 2,
                });
            };
        }
    }, [image, defaultTemplate, dimensions]);

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-blue-600 text-white py-4 shadow-lg">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
            </header>

            <main className="flex-grow bg-gray-100 p-6">
                <div className="container mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Select Default Greeting Card Template</h2>
                        <input
                            type="file"
                            onChange={handleTemplateUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {defaultTemplate && (
                        <div className="mt-6 bg-gradient-to-tr from-violet-200 via-cyan-300 to-green-200 p-4">
                            <h2 className="text-lg font-semibold">Default Template Preview</h2>
                            <Stage
                                width={dimensions.width}
                                height={dimensions.height - 104}
                                scaleX={scale}
                                scaleY={scale}
                                x={offset.x}
                                y={offset.y}
                            >
                                <Layer>
                                    <KonvaImage
                                        image={image}
                                        width={imageDimensions.width}
                                        height={imageDimensions.height}
                                        opacity={0.7}
                                    />
                                </Layer>
                            </Stage>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
