import fs from 'node:fs/promises';
import {v4 as uuidv4} from 'uuid';
import sharp from "sharp";
import path from 'path';
class FileUpload {
    private file: File | null = null;
    private allowedMimes: Array<string> = ['image/jpeg', 'image/png', 'image/jpg'];
    private filePath: string = '/uploaded-images/profile-pictures';
    private basePublicPath: string = './public';
    private isFileImage: boolean = true;
    private allowImageCompress: boolean = false;
    private compressImageWidth: number = 512;
    private compressImageHeight: number = 512;

    /**
     * Constructs a new FileUpload instance with an optional file.
     *
     * @param {File | null} file - The file to set for the instance.
     * @return {this} The current instance of the FileUpload object.
     */
    constructor(file: File | null = null) {
        this.setFile(file);
    }

    /**
     * Sets the file for the object.
     *
     * @param {File | null} file - The file to set.
     * @return {this} The current instance of the object.
     */
    setFile(file: File | null) {
        this.file = file;
        return this;
    }
    /**
     * Gets the current file.
     *
     * @return {File | null} The current file.
     */
    getFile() {
        return this.file;
    }
    /**
     * Sets the value indicating whether the file is an image.
     *
     * @param {boolean} isFileImage - The value indicating if the file is an image.
     * @return {FileUpload} - The instance of the FileUpload class.
     */
    setIsFileImage(isFileImage: boolean) {
        this.isFileImage = isFileImage;
        return this;
    }
    /**
     * Returns the value indicating whether the file is an image.
     *
     * @return {boolean} The value indicating if the file is an image.
     */
    getIsFileImage() {
        return this.isFileImage;
    }
    /**
     * Sets whether image compression is allowed.
     *
     * @param {boolean} allowImageCompress - The value indicating if image compression is allowed.
     * @return {FileUpload} The updated FileUpload instance.
     */
    setAllowImageCompress(allowImageCompress: boolean) {
        this.allowImageCompress = allowImageCompress;
        return this;
    }
    /**
     * Returns the value indicating whether image compression is allowed.
     *
     * @return {boolean} The value indicating if image compression is allowed.
     */
    getAllowImageCompress() {
        return this.allowImageCompress;
    }
    /**
     * Sets the allowed MIME types for file uploads.
     *
     * @param {Array<string>} allowedMimes - The array of allowed MIME types.
     * @return {this} The current instance of the class.
     */
    setAllowedMimes(allowedMimes: Array<string>) {
        this.allowedMimes = allowedMimes;
        return this;
    }
    /**
     * Retrieves the allowed MIME types for file uploads.
     *
     * @return {Array<string>} The array of allowed MIME types.
     */
    getAllowedMimes() {
        return this.allowedMimes;
    }
    /**
     * Sets the width of the image to be compressed.
     *
     * @param {number} width - The width of the image in pixels.
     */
    setImageWidth(width: number) {
        this.compressImageWidth = width;
    }
    /**
     * Sets the height of the image to be compressed.
     *
     * @param {number} height - The height of the image in pixels.
     * @return {void} This function does not return a value.
     */
    setImageHeight(height: number) {
        this.compressImageHeight = height;
    }
    /**
     * Sets the file path for the uploaded file.
     *
     * @param {string} filePath - The file path to set.
     * @return {FileUpload} The updated FileUpload instance.
     */
    setFilePath(filePath: string) {
        this.filePath = filePath;
        return this;
    }
    /**
     * Returns the file path of the uploaded file.
     *
     * @return {string} The file path of the uploaded file.
     */
    getFilePath() {
        return this.filePath;
    }
    /**
     * Validates a file and performs image compression if necessary.
     *
     * @param {File} file - The file to be validated.
     * @return {Promise<{success: boolean, message: string, error: boolean, filePath?: string}>} An object indicating the success or failure of the validation, along with an optional file path if the file is valid and image compression is allowed.
     */
    async validate(file: File) {
        try {
            if(!file) {
                return {
                    success: false,
                    message: "No file received.",
                    error: false
                }
            }
            if(!this.getAllowedMimes().includes(file.type)) {
                return {
                    success: false,
                    message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
                    error: false
                }
            }
            const arrayBuffer = Buffer.from(await file.arrayBuffer());
            const buffer = new Uint8Array(arrayBuffer);
            // let filePath = `${file.name}`
            var filename = file.name;
            var filePath = path.join(this.basePublicPath, this.getFilePath(), filename);
            await fs.writeFile(filePath, buffer);
            if(this.getAllowImageCompress() && this.getIsFileImage()) {
                let filenameSplit = file.name.split('.')
                if(filenameSplit.length > 0) {
                    filenameSplit[filenameSplit.length - 1] = 'webp'
                    filename = filenameSplit.join(".")
                }
                else {
                    filenameSplit.push('.webp')
                    filename = filenameSplit.join("")
                }
                const fileId = uuidv4()
                const newFilename = path.join(this.getFilePath(), fileId + '_' +
                filename);
                const newFilePath = path.join(this.basePublicPath, newFilename);
                await sharp(filePath).resize({
                    width: this.compressImageWidth,
                    height: this.compressImageHeight
                }).webp({
                    quality: 60
                }).toFile(newFilePath)
                fs.unlink(filePath);
                filePath = newFilename;
            }
            else {
                filePath = path.join(this.getFilePath(), filename);
            }
            return {
                success: true,
                error: false,
                filePath: filePath
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                error: true
            }
        }
    }
}

export default FileUpload;