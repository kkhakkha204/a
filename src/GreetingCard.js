import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Text } from 'react-konva';
import { FaBold, FaItalic, FaUnderline, FaEdit} from 'react-icons/fa';
import { useImage } from 'react-konva-utils';
import {
    MdFace,
    MdInstallMobile,
    MdOutlineInstallDesktop,
    MdUploadFile,
    MdOutlineTextFields,
    MdDeleteForever,
    MdEditSquare
} from "react-icons/md";
import Konva from "konva";

const GreetingCard = () => {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const stageRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const [uploadedImage, setUploadedImage] = useState(localStorage.getItem('defaultCardTemplate') || null);
    const [image] = useImage(uploadedImage);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const imageRef = useRef();

    const [avatarImage, setAvatarImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const avatarRef = useRef(null);
    const transformerRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [avatarDimensions, setAvatarDimensions] = useState({ width: 200, height: 200 });

    const [textBoxes, setTextBoxes] = useState([]);
    const [selectedTextBox, setSelectedTextBox] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [textFontSize, setTextFontSize] = useState(60);
    const [textFontFamily, setTextFontFamily] = useState('Arial');
    const textRef = useRef(null);
    const transformerTextRef = useRef(null);
    const [isTextMenuOpen, setIsTextMenuOpen] = useState(false);
    const [textColor, setTextColor] = useState('#000000');
    const [isTextBold, setIsTextBold] = useState(false);
    const [isTextItalic, setIsTextItalic] = useState(false);
    const [isTextUnderline, setIsTextUnderline] = useState(false);
    const [inputFontSize, setInputFontSize] = useState(textFontSize);

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
                const scaleHeight = (dimensions.height - 104) / imgHeight;
                const minScale = Math.min(scaleWidth, scaleHeight);
                setScale(minScale);

                // Căn giữa stage dựa trên kích thước và tỷ lệ của ảnh
                setOffset({
                    x: (dimensions.width - imgWidth * minScale) / 2,
                    y: (dimensions.height - 104 - imgHeight * minScale) / 2,
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
        const originalOpacity = imageRef.current.opacity();

        // Đặt kích thước stage đúng với mẫu thiệp và không thu nhỏ
        stage.width(imageDimensions.width);
        stage.height(imageDimensions.height);
        stage.scale({ x: 1, y: 1 });
        stage.position({ x: 0, y: 0 });

        imageRef.current.opacity(1);

        // Tạo dữ liệu hình ảnh
        const uri = stage.toDataURL({ mimeType: 'image/png' });

        // Phục hồi kích thước và tỷ lệ ban đầu
        stage.width(originalWidth);
        stage.height(originalHeight);
        stage.scale({ x: originalScaleX, y: originalScaleY });
        stage.position({ x: originalX, y: originalY });
        imageRef.current.opacity(originalOpacity);

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

                // Tính tỷ lệ gốc của ảnh
                const aspectRatio = img.width / img.height;
                setAvatarDimensions({ width: 200, height: 200 / aspectRatio });
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
            x: 200,
            y: 200,
            height:80,
            color: textColor,
            isBold: false,
            isItalic: false,
            isUnderline: false,
            fontSize: 60,
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

// Toggle Bold, Italic, Underline styles
    const toggleBold = () => {
        if (selectedTextBox) {
            const updatedTextBoxes = textBoxes.map((box) =>
                box.id === selectedTextBox.id ? { ...box, isBold: !box.isBold } : box
            );
            setTextBoxes(updatedTextBoxes);
            setIsTextBold(!isTextBold);
        }
    };

    const toggleItalic = () => {
        if (selectedTextBox) {
            const updatedTextBoxes = textBoxes.map((box) =>
                box.id === selectedTextBox.id ? { ...box, isItalic: !box.isItalic } : box
            );
            setTextBoxes(updatedTextBoxes);
            setIsTextItalic(!isTextItalic);
        }
    };

    const toggleUnderline = () => {
        if (selectedTextBox) {
            const updatedTextBoxes = textBoxes.map((box) =>
                box.id === selectedTextBox.id ? { ...box, isUnderline: !box.isUnderline } : box
            );
            setTextBoxes(updatedTextBoxes);
            setIsTextUnderline(!isTextUnderline);
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
        const newSize = Number(e.target.value);
        setTextFontSize(newSize);
        setInputFontSize(newSize); // Cập nhật inputFontSize
        if (selectedTextBox) {
            const updatedTextBoxes = textBoxes.map((box) =>
                box.id === selectedTextBox.id ? { ...box, fontSize: newSize } : box
            );
            setTextBoxes(updatedTextBoxes);
        }
    };

    const handleInputFontSizeChange = (e) => {
        const newSize = Number(e.target.value);
        setInputFontSize(newSize);
        setTextFontSize(newSize);
        if (selectedTextBox) {
            const updatedTextBoxes = textBoxes.map((box) =>
                box.id === selectedTextBox.id ? { ...box, fontSize: newSize } : box
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

    const handleTextColorChange = (e) => {
        setTextColor(e.target.value);
        if (selectedTextBox) {
            const updatedTextBoxes = textBoxes.map((box) =>
                box.id === selectedTextBox.id ? { ...box, color: e.target.value } : box
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

    const [renderedImage, setRenderedImage] = useState(null);
    const [isRenderedImageVisible, setIsRenderedImageVisible] = useState(false);

    const renderCanvasToPNG = () => {
        const stage = stageRef.current;
        if (stage) {
            const originalNodes = [];

            // Clone các Image nodes
            stage.find('Image').forEach((imageNode) => {
                const clonedImage = imageNode.clone();
                originalNodes.push(clonedImage);
            });

            // Clone các Text nodes
            stage.find('Text').forEach((textNode) => {
                const clonedText = textNode.clone();
                originalNodes.push(clonedText);
            });

            // Tạo một tempLayer mới để chứa các node đã clone
            const tempLayer = new Konva.Layer();

            // Thêm tất cả các node đã clone vào tempLayer
            originalNodes.forEach((node) => {
                node.opacity(1);
                tempLayer.add(node);
            });

            // Lấy thông tin về avatar (ví dụ vị trí x, y và kích thước)
            const avatarNode = stage.findOne('.avatar'); // Giả sử ảnh đại diện có class 'avatar'
            const avatarX = avatarNode ? avatarNode.x() : 0;
            const avatarY = avatarNode ? avatarNode.y() : 0;
            const avatarWidth = avatarNode ? avatarNode.width() : 0;
            const avatarHeight = avatarNode ? avatarNode.height() : 0;

            // Tạo vùng clip sao cho không bao gồm ảnh đại diện
            const canvasWidth = stage.width();
            const canvasHeight = stage.height();

            // Tính toán các giá trị clip, trừ phần ảnh đại diện
            const clipX = 0;
            const clipY = 0;
            const clipWidth = canvasWidth;
            const clipHeight = canvasHeight;

            // Cắt phần ảnh đại diện ra ngoài
            tempLayer.cache();
            tempLayer.clip({
                x: clipX,
                y: clipY,
                width: clipWidth,
                height: clipHeight,
            });

            // Render thành data URL
            const dataURL = tempLayer.toDataURL({ pixelRatio: 3 });
            setRenderedImage(dataURL);
            setIsRenderedImageVisible(true);

            tempLayer.destroy();

            // Ẩn stage gốc sau khi render
            stage.hide();
        } else {
            console.error("Stage is not available");
        }
    };

    const hideRenderedImage = () => {
        setRenderedImage(null);
        setIsRenderedImageVisible(false);
        stageRef.current.show();
    };



    return (
        <div className="flex flex-col h-screen bg-gradient-to-tr from-violet-200 via-cyan-300 to-green-200 hover:bg-gradient-to-r  ">
            {/* Canvas Area */}
            <div className="flex-grow p-4">
                <Stage
                    width={dimensions.width}
                    height={dimensions.height - 104}
                    ref={stageRef}
                    x={offset.x}
                    scaleX={scale}
                    scaleY={scale}
                    onClick={handleStageClick}
                >
                    <Layer>

                        {avatarImage && (
                            <KonvaImage
                                image={avatarImage}
                                x={300}
                                y={200}
                                width={avatarDimensions.width}  // Đặt kích thước đã tính theo tỷ lệ gốc
                                height={avatarDimensions.height} // Đặt kích thước đã tính theo tỷ lệ gốc
                                draggable
                                onClick={handleAvatarClick}
                                onTouchEnd={handleAvatarClick}
                                ref={avatarRef}
                                listening={true}
                            />
                        )}

                        {image && (
                            <KonvaImage
                                image={image}
                                width={imageDimensions.width}
                                height={imageDimensions.height}
                                listening={false}
                                ref={imageRef}
                                opacity={0.7}

                            />
                        )}

                        <Transformer
                            ref={transformerRef}
                            rotateEnabled={true}
                            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (newBox.width < 50 || newBox.height < 50) return oldBox;
                                return newBox;
                            }}
                        />

                        {textBoxes.map((box) => (
                            <Text
                                key={box.id}
                                text={box.content}
                                x={box.x}
                                y={box.y}
                                height={box.height}
                                fontSize={box.fontSize}
                                fontFamily={box.fontFamily}
                                fill={box.color || textColor}
                                fontStyle={`${box.isBold ? 'bold' : ''} ${box.isItalic ? 'italic' : ''}`}
                                textDecoration={box.isUnderline ? 'underline' : ''}
                                draggable
                                onClick={() => handleTextClick(box)}
                                onTap={() => handleTextClick(box)}
                                ref={box.ref}
                            />
                        ))}

                        <Transformer ref={transformerTextRef} />
                    </Layer>
                </Stage>
            </div>

            {/* Text Edit Menu */}
            {isTextMenuOpen && (
                <div className="text-menu bg-white bg-opacity-80 p-4 fixed top-0 left-0 right-0 z-20 shadow-lg backdrop-blur-md">
                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            value={textContent}
                            onChange={handleTextChange}
                            placeholder="Nhập nội dung ô chữ"
                            className="p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <button onClick={toggleBold}
                                className={`ml-2 bg-orange-600 text-white px-1 py-1.5 rounded hover:bg-red-600 ${isTextBold ? 'font-bold' : ''}`}>
                            <FaBold />
                        </button>
                        <button onClick={toggleItalic}
                                className={`ml-2 bg-orange-600 text-white px-1 py-1.5 rounded hover:bg-red-600 ${isTextItalic ? 'italic' : ''}`}>
                            <FaItalic />
                        </button>
                        <button onClick={toggleUnderline}
                                className={`ml-2 bg-orange-600 text-white px-1 py-1.5 rounded hover:bg-red-600 ${isTextUnderline ? 'underline' : ''}`}>
                            <FaUnderline />
                        </button>
                        <input
                            type="number"
                            value={inputFontSize}
                            onChange={handleInputFontSizeChange}
                            className="p-2 rounded shadow-sm ml-2"
                            min={10} // Thay đổi theo nhu cầu của bạn
                        />
                        <select
                            value={textFontSize}
                            onChange={handleFontSizeChange}
                            className="p-2 rounded shadow-sm"
                        >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={25}>25</option>
                            <option value={30}>30</option>
                            <option value={35}>35</option>
                            <option value={45}>45</option>
                            <option value={55}>55</option>
                            <option value={65}>65</option>
                            <option value={75}>75</option>
                            <option value={85}>85</option>
                            <option value={95}>95</option>
                        </select>
                        <select
                            value={textFontFamily}
                            onChange={handleFontFamilyChange}
                            className="p-2 rounded shadow-sm"
                        >
                            <option value="Arial">Arial</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Tahoma">Tahoma</option>
                            <option value="Calibri">Calibri</option>
                            <option value="Garamond">Garamond</option>


                        </select>
                        <input
                            type="color"
                            value={textColor}
                            onChange={handleTextColorChange}
                            className="p-2 rounded shadow-sm"
                        />
                        <button
                            onClick={deleteTextBox}
                            className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                            <MdDeleteForever style={{ fontSize: '1.5rem' }}/>
                        </button>
                    </div>
                </div>
            )}

            {/* General Menu */}
            {isMenuOpen && (
                <div className="bg-white bg-opacity-80 p-4 fixed top-0 left-0 right-0 z-20 shadow-lg backdrop-blur-md">
                <div className="flex justify-around">
                        <button
                            className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            onClick={deleteAvatar}
                        >
                            <MdDeleteForever style={{ fontSize: '1.5rem' }}/>
                        </button>
                    </div>
                </div>
            )}

            {/* Footer Menu */}
            <div
                className="bg-gradient-to-r from-fuchsia-900 via-cyan-700 to-teal-600 p-4 fixed bottom-0 left-0 right-0 flex items-center justify-around text-white">
                <label className="flex flex-col items-center cursor-pointer">
                    <MdUploadFile className="text-2xl mb-1"/>
                    <span>Card</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </label>

                <label className="flex flex-col items-center cursor-pointer">
                    <MdFace className="text-2xl mb-1"/>
                    Avatar
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                    />
                </label>

                <button onClick={addTextBox} className="flex flex-col items-center cursor-pointer">
                    <MdOutlineTextFields className="text-2xl mb-1"/>
                    <span>Text</span>
                </button>

                <button
                    onClick={renderCanvasToPNG}
                    className="flex flex-col items-center cursor-pointer"
                >
                    <MdInstallMobile className="text-2xl mb-1"/>
                    <span>Download</span>
                </button>

                <button
                    onClick={handleDownload}
                    className="flex flex-col items-center cursor-pointer"
                >
                    <MdOutlineInstallDesktop className="text-2xl mb-1"/>
                    <span>Download</span>
                </button>
            </div>

            {/* Hiển thị ảnh render ở giữa màn hình */}
            {renderedImage && (
                <div className="rendered-image-container flex justify-center items-center h-full">
                    <img src={renderedImage} alt="Rendered" className="rendered-image"/>
                    <button
                        onClick={hideRenderedImage}
                        className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                        <FaEdit style={{ fontSize: '1.5rem' }}/>
                    </button>

                </div>
            )}
        </div>
    );
};

export default GreetingCard;
