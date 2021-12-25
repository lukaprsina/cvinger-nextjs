import React from "react"

import { Typography, Box } from "@mui/material"
import NextjsImage from "next/image"

type LogoImageProps = {
    src: any,
    caption: string,
    center?: boolean,
    noGallery?: boolean,
    noBorder?: boolean,
    priority?: boolean,
}

const extension_regex = /(?:\.([^.]+))?$/;

const LogoImage = ({ src, caption, center = false, noBorder = false, noGallery = false, priority = false }: LogoImageProps) => {
    let result = extension_regex.exec(src.src);
    let extension = result ? result[1] : "";

    let blur = extension === "jpg" || extension === "png" || extension === "webp" || extension === "avif";

    return (
        <Box sx={{
            margin: "0", "& img": {
                width: "100%",
                maxHeight: "700px",
                borderRadius: noBorder ? "0" : "7px",
                display: "block",
                margin: "auto",
            }
        }}>
            <NextjsImage
                src={src}
                alt={caption}
                placeholder={blur ? "blur" : "empty"}
                priority={priority}
            />
            <Typography
                variant="caption"
                paragraph
                align={center ? "center" : "left"}
            >
                {caption}
            </Typography>
        </Box >
    )
}

export default LogoImage
