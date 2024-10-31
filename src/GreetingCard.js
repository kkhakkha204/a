import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Text } from 'react-konva';
import { FaUpload, FaDownload } from 'react-icons/fa';
import { useImage } from 'react-konva-utils';

const GreetingCard = () => {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [uploadedImage, setUploadedImage] = useState(null);
    const [image] = useImage(uploadedImage);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [scale, setScale] = useState(1);
    const stageRef = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const [avatarImage, setAvatarImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const avatarRef = useRef(null);
    const transformerRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    const [textBoxes, setTextBoxes] = useState([]);
    const [selectedTextBox, setSelectedTextBox] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [textFontSize, setTextFontSize] = useState(20);
    const [textFontFamily, setTextFontFamily] = useState('Arial');
    const textRef = useRef(null);
    const transformerTextRef = useRef(null);
    const [isTextMenuOpen, setIsTextMenuOpen] = useState(false);

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

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setUploadedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (image) {
            const img = new window.Image();
            img.src = uploadedImage;

            img.onload = () => {
                const imgWidth = img.width;
                const imgHeight = img.height;
                setImageDimensions({ width: imgWidth, height: imgHeight });

                // Tính tỷ lệ để mẫu thiệp vừa khít với màn hình
                const scaleWidth = dimensions.width / imgWidth;
                const scaleHeight = (dimensions.height - 64) / imgHeight;
                const minScale = Math.min(scaleWidth, scaleHeight);
                setScale(minScale);

                // Căn giữa stage dựa trên kích thước và tỷ lệ của ảnh
                setOffset({
                    x: (dimensions.width - imgWidth * minScale) / 2,
                    y: (dimensions.height - 64 - imgHeight * minScale) / 2,
                });
            };
        }
    }, [image, uploadedImage, dimensions]);

    const handleDownload = () => {
        const stage = stageRef.current;

        // Lưu kích thước và tỷ lệ gốc của Stage để phục hồi sau khi tải
        const originalWidth = stage.width();
        const originalHeight = stage.height();
        const originalScaleX = stage.scaleX();
        const originalScaleY = stage.scaleY();
        const originalX = stage.x();
        const originalY = stage.y();

        // Đặt kích thước stage đúng với mẫu thiệp và không thu nhỏ
        stage.width(imageDimensions.width);
        stage.height(imageDimensions.height);
        stage.scale({ x: 1, y: 1 });
        stage.position({ x: 0, y: 0 });

        // Tạo dữ liệu hình ảnh
        const uri = stage.toDataURL({ mimeType: 'image/png' });

        // Phục hồi kích thước và tỷ lệ ban đầu
        stage.width(originalWidth);
        stage.height(originalHeight);
        stage.scale({ x: originalScaleX, y: originalScaleY });
        stage.position({ x: originalX, y: originalY });

        // Tạo link tải xuống
        const link = document.createElement('a');
        link.href = uri;
        link.download = 'thiep-moi.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Xử lý tải ảnh đại diện
    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const img = new window.Image();
            img.src = reader.result;
            img.onload = () => {
                setAvatarImage(img);
            };
        };
        reader.readAsDataURL(file);
    };

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const handleAvatarClick = () => {
        if (isMobile) {
            setIsMenuOpen((prev) => !prev);
            setSelectedImage(avatarRef.current);
        } else {
            setIsMenuOpen((prev) => !prev);
            setSelectedImage(avatarRef.current);
        }
    };

    // Cập nhật Transformer khi ảnh được chọn
    useEffect(() => {
        if (selectedImage) {
            transformerRef.current.nodes([selectedImage]);
            transformerRef.current.getLayer().batchDraw();
        }else {
            transformerRef.current.nodes([]);
        }
    }, [selectedImage]);

    const handleStageClick = (e) => {
        // Bỏ chọn ảnh đại diện khi bấm ra ngoài
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedImage(null);
            setSelectedTextBox(null);
            setIsMenuOpen(false);
            setIsTextMenuOpen(false);
        }
    };

    // Chức năng xóa ảnh đại diện
    const deleteAvatar = () => {
        setAvatarImage(null);
        setIsMenuOpen(false);
        transformerRef.current.nodes([]);
    };

    const addTextBox = () => {
        const newTextBox = {
            id: Date.now(),
            content: 'Nhập văn bản',
            x: 100,
            y: 100,
            fontSize: textFontSize,
            fontFamily: textFontFamily,
            ref: React.createRef(),
        };
        setTextBoxes([...textBoxes, newTextBox]);
    };

    const handleTextChange = (e) => {
        const newContent = e.target.value;
        setTextContent(newContent);

        if (selectedTextBox) {
            const updatedTextBoxes = textBoxes.map((box) =>
                box.id === selectedTextBox.id ? { ...box, content: newContent } : box
            );
            setTextBoxes(updatedTextBoxes);
        }
    };


    const deleteTextBox = () => {
        if (selectedTextBox) {
            setTextBoxes(textBoxes.filter((box) => box.id !== selectedTextBox.id));
            setSelectedTextBox(null);
            setIsTextMenuOpen(false);
        }
    };

    const handleFontSizeChange = (e) => {
        setTextFontSize(Number(e.target.value));
        if (selectedTextBox) {
            const updatedTextBoxes = textBoxes.map((box) =>
                box.id === selectedTextBox.id ? { ...box, fontSize: Number(e.target.value) } : box
            );
            setTextBoxes(updatedTextBoxes);
        }
    };

    const handleFontFamilyChange = (e) => {
        setTextFontFamily(e.target.value);
        if (selectedTextBox) {
            const updatedTextBoxes = textBoxes.map((box) =>
                box.id === selectedTextBox.id ? { ...box, fontFamily: e.target.value } : box
            );
            setTextBoxes(updatedTextBoxes);
        }
    };


    const handleTextClick = (textBox) => {
        if (isMobile) {
            setSelectedTextBox(textBox);
            setTextContent(textBox.content);
            setIsTextMenuOpen(true);
        } else {
            setSelectedTextBox(textBox);
            setTextContent(textBox.content);
            setIsTextMenuOpen(true);
        }
    };

    useEffect(() => {
        if (selectedTextBox) {
            transformerTextRef.current.nodes([selectedTextBox.ref.current]);
            transformerTextRef.current.getLayer().batchDraw();
        } else {
            transformerTextRef.current.nodes([]);
            setIsTextMenuOpen(false);
            setSelectedTextBox(null);
        }
    }, [selectedTextBox]);


    return (
        <div className="flex flex-col h-screen">
            <div className="flex-grow">
                <Stage
                    width={dimensions.width}
                    height={dimensions.height - 64}
                    ref={stageRef}
                    x={offset.x} // Đặt offset x và y cho stage

                    scaleX={scale} // Đặt tỷ lệ theo kích thước mẫu thiệp
                    scaleY={scale}
                    onClick={handleStageClick}
                >
                    <Layer>
                        {image && (
                            <KonvaImage
                                image={image}
                                width={imageDimensions.width}
                                height={imageDimensions.height}
                            />
                        )}

                        {/* Ảnh đại diện */}
                        {avatarImage && (
                            <KonvaImage
                                image={avatarImage}
                                x={300} // Vị trí ban đầu của ảnh đại diện
                                y={200}
                                width={200}
                                height={200}
                                draggable
                                onClick={handleAvatarClick}
                                onTouchEnd={handleAvatarClick}
                                ref={avatarRef}
                            />
                        )}

                        {/* Transformer cho ảnh đại diện */}
                        <Transformer
                            ref={transformerRef}
                            rotateEnabled={true}
                            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                            boundBoxFunc={(oldBox, newBox) => {

                                if (newBox.width < 50 || newBox.height < 50) {
                                    return oldBox;
                                }
                                return newBox;
                            }}
                        />

                        {/* Các ô chữ */}
                        {textBoxes.map((box) => (
                            <Text
                                key={box.id}
                                text={box.content}
                                x={box.x}
                                y={box.y}
                                fontSize={box.fontSize}
                                fontFamily={box.fontFamily}
                                draggable
                                onClick={() => handleTextClick(box)}
                                ref={box.ref}
                            />
                        ))}
                        {/* Transformer cho ô chữ */}
                        <Transformer
                            ref={transformerTextRef}
                        />
                    </Layer>
                </Stage>
            </div>

            {isTextMenuOpen && (
                <div className="bg-gray-600 p-4 fixed top-0 left-0 right-0 z-10">
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={textContent}
                            onChange={handleTextChange}
                            placeholder="Nội dung ô chữ"
                            className="p-2"
                        />
                        <select value={textFontSize} onChange={handleFontSizeChange} className="ml-2">
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={25}>25</option>
                            <option value={30}>30</option>
                            <option value={35}>35</option>
                            <option value={40}>40</option>
                        </select>
                        <select value={textFontFamily} onChange={handleFontFamilyChange} className="ml-2">
                            <option value="Arial">Arial</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                        </select>
                        <button onClick={deleteTextBox} className="ml-2 bg-red-500 text-white p-2">
                            Xóa ô chữ
                        </button>
                    </div>
                </div>
            )}

            {isMenuOpen && (
                <div className="bg-gray-600 p-4 fixed top-0 left-0 right-0 z-10">
                    <div className="flex justify-around">
                        <button className="text-white" onClick={deleteAvatar}>
                            Xóa ảnh
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-gray-800 p-4 fixed bottom-0 left-0 right-0 flex items-center justify-between">
                <label className="flex items-center cursor-pointer text-white">
                    <FaUpload className="mr-2"/>

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </label>

                <label className="flex items-center cursor-pointer text-white">
                    <FaUpload className="mr-2"/>
                    Tải ảnh đại diện:
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}/>
                </label>
                <button onClick={addTextBox} className="flex items-center cursor-pointer text-white">
                    Thêm ô chữ
                </button>
                <button
                    onClick={handleDownload}
                    className="flex items-center cursor-pointer text-white"
                >
                    <FaDownload className="mr-2"/>
                </button>
            </div>
        </div>
    );
};

export default GreetingCard;
