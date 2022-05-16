/**
 * https://en.wikipedia.org/wiki/Truevision_TGA
 */

// fields more than one byte long are stored in little-endian order
interface TgaHeader {
    // 0x00
    // size of the image id field
    idLength: number;

    // 0x01
    // color map type
    // 0: no color map included
    // 1: a color map is included
    // 2-127: reserved by Truevision
    // 128-255: available for developer use
    colorMapType: number;

    // 0x02
    // image type code
    // 0: no image data included
    // 1: uncompressed, color-mapped image
    // 2: uncompressed, true-color image
    // 3: uncompressed, grey image
    // 9: run-length encoded, color-mapped image
    // 10: run-length encoded, true-color image
    // 11: run-length encoded, grey image
    imageType: number;

    // 0x04-0x03
    // first color map entry index
    colorMapStart: number;
    // 0x06-0x05
    // number of color map entries
    colorMapLength: number;
    // 0x07
    // number of bits per color map entry - 16, 24, 32
    colorMapEntrySize: number;

    // 0x09-0x08
    // x origin of the image
    xOrigin: number;
    // 0x0b-0x0a
    // y origin of the image
    yOrigin: number;
    // 0x0d-0x0c
    // width of the image
    width: number;
    // 0x0f-0x0e
    // height of the image
    height: number;

    // 0x10
    // bits per pixel - 8, 16, 24, 32
    pixelDepth: number;

    // 0x11
    // image descriptor
    // bits 3-0: alpha channel depth
    // bits 5-4: pixel ordering
    descriptor: number;
}

enum ImageType {
    NO_DATA = 0,
    INDEXED = 1,
    RGB = 2,
    GREY = 3,
    RLE_INDEXED = 9,
    RLE_RGB = 10,
    RLE_GREY = 11,
}

// the 4-5 bits of the descriptor indicate the pixel ordering
enum ImageOrigin {
    MASK = /***********/ 0b00110000,
    TOP = /************/ 0b00100000,
    RIGHT = /**********/ 0b00010000,
    BOTTOM_LEFT = /****/ 0b00000000,
    BOTTOM_RIGHT = /***/ 0b00010000,
    TOP_LEFT = /*******/ 0b00100000,
    TOP_RIGHT = /******/ 0b00110000,
}

const rleImageTypeSet = new Set([
    ImageType.RLE_INDEXED,
    ImageType.RLE_RGB,
    ImageType.RLE_GREY,
]);

const colorMapImageTypeSet = new Set([
    ImageType.INDEXED,
    ImageType.RLE_INDEXED,
]);

const greyImageTypeSet = new Set([ImageType.GREY, ImageType.RLE_GREY]);

export class TgaImage {
    #header: TgaHeader;

    // look-up table containing color map data
    #colorMap: Uint8Array | null = null;

    // store raw
    #originImageData: Uint8Array;

    // store image data with rgba sequence
    #imageData: Uint8ClampedArray | null = null;

    constructor(rawData: Uint8Array) {
        if (rawData.length < 0x12) {
            throw new Error('No enough data to contain header');
        }

        // read header
        const header = {
            idLength: rawData[0x00],
            colorMapType: rawData[0x01],
            imageType: rawData[0x02],
            colorMapStart: rawData[0x03] | (rawData[0x04] << 8),
            colorMapLength: rawData[0x05] | (rawData[0x06] << 8),
            colorMapEntrySize: rawData[0x07],
            xOrigin: rawData[0x08] | (rawData[0x09] << 8),
            yOrigin: rawData[0x0a] | (rawData[0x0b] << 8),
            width: rawData[0x0c] | (rawData[0x0d] << 8),
            height: rawData[0x0e] | (rawData[0x0f] << 8),
            pixelDepth: rawData[0x10],
            descriptor: rawData[0x11],
        };
        this.#header = header;
        console.log(header);
        this.#checkHeader();

        let offset = 0x12;

        // skip image id
        offset += header.idLength;
        if (offset > rawData.length) {
            throw new Error('No enough data to contain image data');
        }

        // read color map
        if (this.hasColorMap) {
            const colorMapSize =
                header.colorMapLength * (header.colorMapEntrySize >> 3);
            this.#colorMap = rawData.subarray(offset, offset + colorMapSize);
            offset += colorMapSize;
        }

        const pixelSize = header.pixelDepth >> 3;
        const pixelCount = header.width * header.height;
        const byteCount = pixelCount * pixelSize;

        if (this.isRle) {
            // run-length encoded
            this.#originImageData = this.#decodeRle(
                rawData,
                offset,
                pixelSize,
                byteCount,
            );
        } else {
            // raw pixels
            this.#originImageData = rawData.subarray(
                offset,
                offset + (this.hasColorMap ? pixelCount : byteCount),
            );
        }
    }

    get isRle() {
        return rleImageTypeSet.has(this.#header.imageType);
    }

    get hasColorMap() {
        return colorMapImageTypeSet.has(this.#header.imageType);
    }

    get isGrey() {
        return greyImageTypeSet.has(this.#header.imageType);
    }

    static open(url: string) {
        return fetch(url)
            .then((response) => response.arrayBuffer())
            .then((buffer) => new TgaImage(new Uint8Array(buffer)));
    }

    getImageData() {
        if (!this.#imageData) {
            this.#parseRawImageData();
        }

        return {
            width: this.#header.width,
            height: this.#header.height,
            data: this.#imageData!.subarray(0),
        };
    }

    #checkHeader() {
        const header = this.#header;

        if (header === undefined) {
            throw new Error('Header is not loaded.');
        }

        // don't support no data image
        if (header.imageType === ImageType.NO_DATA) {
            throw new Error('No image data.');
        }

        // check color map
        if (this.hasColorMap) {
            if (
                header.colorMapLength > 256 ||
                header.colorMapEntrySize !== 24 ||
                header.colorMapType !== 1
            ) {
                throw new Error('Invalid color map for indexed type.');
            }
        } else {
            if (header.colorMapType !== 0) {
                throw new Error("The image don't need a color map.");
            }
        }

        // check image size
        if (!header.width || !header.height) {
            throw new Error('Invalid image size.');
        }

        // check pixel size
        if (
            header.pixelDepth !== 8 &&
            header.pixelDepth !== 16 &&
            header.pixelDepth !== 24 &&
            header.pixelDepth !== 32
        ) {
            throw new Error(`Invalid pixel size "${header.pixelDepth}".`);
        }
    }

    #decodeRle(
        rawData: Uint8Array,
        offset: number,
        pixelSize: number,
        outputSize: number,
    ) {
        const output = new Uint8Array(outputSize);
        let position = 0;

        while (position < outputSize) {
            // read the length attribute byte
            const flag = rawData[offset];
            offset += 1;

            // 2-8 bits indicate the length of the following data
            const pixelCount = (flag & 0b01111111) + 1;

            // the first bit indicates repeated or not
            // 1: repeated
            // 0: not repeated
            if (flag & 0b10000000) {
                const pixel = new Uint8Array(pixelSize);

                // get the repeated pixel
                for (let i = 0; i < pixelSize; i += 1) {
                    pixel[i] = rawData[offset + i];
                }
                offset += pixelSize;

                // copy pixels
                for (let i = 0; i < pixelCount; i += 1) {
                    output.set(pixel, position);
                    position += pixelSize;
                }
            } else {
                const byteCount = pixelCount * pixelSize;
                // copy pixels
                for (let i = 0; i < byteCount; i += 1) {
                    output[position + i] = rawData[offset + i];
                }
                position += byteCount;
                offset += byteCount;
            }
        }

        return output;
    }

    #parseRawImageData() {
        const { width, height, pixelDepth, descriptor } = this.#header;
        const imageData = new Uint8ClampedArray(width * height * 4);

        const isTop = descriptor & ImageOrigin.TOP;
        const yStart = isTop ? 0 : height - 1;
        const yEnd = isTop ? height : -1;
        const yStep = isTop ? 1 : -1;

        const isLeft = !(descriptor & ImageOrigin.RIGHT);
        const xStart = isLeft ? 0 : width - 1;
        const xEnd = isLeft ? width : -1;
        const xStep = isLeft ? 1 : -1;

        const iStep = pixelDepth >> 3;
        const isGrey = this.isGrey;

        for (let i = 0, y = yStart; y !== yEnd; y += yStep) {
            for (let x = xStart; x !== xEnd; x += xStep, i += iStep) {
                let r = 0,
                    g = 0,
                    b = 0,
                    a = 0;
                switch (pixelDepth) {
                    case 8:
                        if (isGrey) {
                            r = g = b = this.#originImageData[i];
                        } else {
                            const color = this.#originImageData[i];
                            r = this.#colorMap![color * 3 + 2];
                            g = this.#colorMap![color * 3 + 1];
                            b = this.#colorMap![color * 3 + 0];
                        }
                        a = 255;
                        break;

                    case 16:
                        if (isGrey) {
                            r = g = b = this.#originImageData[i];
                            a = this.#originImageData[i + 1];
                        } else {
                            const color =
                                this.#originImageData[i] |
                                (this.#originImageData[i + 1] << 8);
                            r = color & (0x7c00 >> 7);
                            g = color & (0x03e0 >> 2);
                            b = color & (0x001f >> 3);
                            a = color & 0x8000 ? 0 : 255;
                        }
                        break;

                    case 24:
                        r = this.#originImageData[i + 2];
                        g = this.#originImageData[i + 1];
                        b = this.#originImageData[i + 0];
                        a = 255;
                        break;

                    case 32:
                        r = this.#originImageData[i + 2];
                        g = this.#originImageData[i + 1];
                        b = this.#originImageData[i + 0];
                        a = this.#originImageData[i + 3];
                        break;
                }
                imageData[(x + width * y) * 4 + 0] = r;
                imageData[(x + width * y) * 4 + 1] = g;
                imageData[(x + width * y) * 4 + 2] = b;
                imageData[(x + width * y) * 4 + 3] = a;
            }
        }

        this.#imageData = imageData;
    }
}

export default TgaImage;
