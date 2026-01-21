enum ImageExtensions {
    png = 'png',
    jpeg = 'jpeg',
    jpg = 'jpg',
    svg = 'svg',
    webp = 'webp',
}

enum VideoExtensions {
    mp4 = 'mp4',
    mov = 'mov',
    webm = 'webm',
    xm4v = 'x-m4v',
    avi = 'avi',
}

enum DocumentExtensions {
    pdf = 'pdf',
    doc = 'doc',
    docx = 'docx',
    csv = 'csv',
    xlsx = 'xlsx',
}

enum AcceptHeader {
    ImageJPEG = 'image/jpeg',
    ImageJPG = 'image/jpg',
    ImagePNG = 'image/png',
    ImageSVG = 'image/svg',
    ImageWebP = 'image/webp',
    PDF = 'application/pdf',
    Doc = 'application/msword',
    Docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    CSV = 'text/csv',
    XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    VideoMP4 = 'video/mp4',
    VideoWebM = 'video/webm',
    VideoAVI = 'video/avi',
    VideoMOV = 'video/mov',
    VideoXM4 = 'video/x-m4v',
}

type FileProperties = {
    LOCATION: string;
    EXTENSIONS: (ImageExtensions | VideoExtensions | DocumentExtensions)[];
    MAX_FILES: number;
    MAX_SIZE: number;
};

const defaultFileSize = 10485760;

const UploadConfig: Record<string, FileProperties> = Object.freeze({
    ONBOARDINGS_IMAGES: {
        LOCATION: 'onboarding/images',
        EXTENSIONS: [ImageExtensions.png, ImageExtensions.jpeg, ImageExtensions.jpg],
        ACCEPT: [AcceptHeader.ImagePNG, AcceptHeader.ImageJPEG, AcceptHeader.ImageJPG],
        MAX_FILES: 10,
        MAX_SIZE: Number(process.env.MAX_LAND_IMAGES_SIZE ?? defaultFileSize),
    },
    CHAT_MEDIA: {
        LOCATION: 'chats/media',
        EXTENSIONS: [
            ImageExtensions.png,
            ImageExtensions.jpeg,
            ImageExtensions.jpg,
            ImageExtensions.webp,
            VideoExtensions.mp4,
            VideoExtensions.mov,
            VideoExtensions.webm,
            VideoExtensions.xm4v,
            VideoExtensions.avi,
            DocumentExtensions.pdf,
            DocumentExtensions.doc,
            DocumentExtensions.docx,
            DocumentExtensions.csv,
            DocumentExtensions.xlsx,
        ],
        ACCEPT: [
            AcceptHeader.ImageJPEG,
            AcceptHeader.ImageJPG,
            AcceptHeader.ImagePNG,
            AcceptHeader.ImageSVG,
            AcceptHeader.ImageWebP,
            AcceptHeader.PDF,
            AcceptHeader.Doc,
            AcceptHeader.Docx,
            AcceptHeader.CSV,
            AcceptHeader.XLSX,
            AcceptHeader.VideoMP4,
            AcceptHeader.VideoWebM,
            AcceptHeader.VideoAVI,
            AcceptHeader.VideoMOV,
            AcceptHeader.VideoXM4,
        ],
        MAX_FILES: 5,
        MAX_SIZE: Number(process.env.MAX_CHAT_MEDIA_SIZE ?? defaultFileSize),
    },
});

const ExtensionToMime: Record<string, string> = {
    [ImageExtensions.jpeg]: AcceptHeader.ImageJPEG,
    [ImageExtensions.jpg]: AcceptHeader.ImageJPG,
    [ImageExtensions.png]: AcceptHeader.ImagePNG,
    [ImageExtensions.svg]: AcceptHeader.ImageSVG,
    [ImageExtensions.webp]: AcceptHeader.ImageWebP,
    [VideoExtensions.mp4]: AcceptHeader.VideoMP4,
    [VideoExtensions.mov]: AcceptHeader.VideoMOV,
    [VideoExtensions.webm]: AcceptHeader.VideoWebM,
    [VideoExtensions.xm4v]: AcceptHeader.VideoXM4,
    [VideoExtensions.avi]: AcceptHeader.VideoAVI,
    [DocumentExtensions.pdf]: AcceptHeader.PDF,
    [DocumentExtensions.doc]: AcceptHeader.Doc,
    [DocumentExtensions.docx]: AcceptHeader.Docx,
    [DocumentExtensions.csv]: AcceptHeader.CSV,
    [DocumentExtensions.xlsx]: AcceptHeader.XLSX,
};

export {
    ImageExtensions,
    VideoExtensions,
    DocumentExtensions,
    AcceptHeader,
    FileProperties,
    defaultFileSize,
    UploadConfig,
    ExtensionToMime,
};
