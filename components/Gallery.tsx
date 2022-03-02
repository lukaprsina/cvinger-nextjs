import React, { useEffect, useState } from "react"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Scrollbar, A11y, Keyboard } from "swiper"
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/keyboard';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import NextjsImage from "next/image"

import useEventListener from "./useEventListener";
import ArticleImage from "./ArticleImage";
import { Container, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useRouter } from "next/router";

type GalleryProps = {
    children: React.ReactElement;
}

interface StaticImageData {
    src: string
    height: number
    width: number
    blurDataURL?: string
}

type GalleryImage = {
    src: StaticImageData,
    caption: string,
}

function iterateChildren(children: JSX.Element, galleryCallback: (source: number) => void, sources: GalleryImage[]): JSX.Element {
    let next: JSX.Element | JSX.Element[] = children.props.children

    let new_children = children;
    let new_next: JSX.Element[] = [];
    let returned_children: JSX.Element = children;
    let add: { children?: any } = {}

    if (Array.isArray(next)) {
        next.forEach((child: JSX.Element, index: number) => {
            const returned_children = iterateChildren(child, galleryCallback, sources)
            new_next.push(React.cloneElement(returned_children, { key: index }));
        })
    }
    else if (React.isValidElement(next)) {
        const returned_children = iterateChildren(next, galleryCallback, sources)
        new_next.push(React.cloneElement(returned_children));
    }

    if (new_next.length === 1)
        add.children = new_next[0];
    else if (new_next.length > 1)
        add.children = [...new_next];

    if (children.type === ArticleImage && !children.props.noGallery) {
        const gallery_image = { src: children.props.src, caption: children.props.caption }
        sources.push(gallery_image);
        let index = sources.length - 1
        new_children = React.cloneElement(returned_children, {
            galleryCallback: () => {
                galleryCallback(index)
            },
            ...add
        })
    }
    else {
        new_children = React.cloneElement(returned_children, {
            ...add
        })
    }

    return new_children;
}

const swiper_button_color = "black";
let destroyedSwiper = true;

/* Todo: break up components, beacuse it rerenders too many times */

function Gallery({ children }: GalleryProps) {
    const [showGallery, setShowGallery] = useState(false);
    const [showSubtitles, setShowSubtitles] = useState(true);
    const [slideIndex, setSlideIndex] = useState(0);
    const [galleryLocked, setGalleryLocked] = useState(false);

    useEventListener('orientationchange', () => {
        setGalleryLocked(true)
        setTimeout(() => setGalleryLocked(false), 1000)
    })

    let sources: GalleryImage[] = []
    const router = useRouter()
    const galleryCallback = (index: number) => {
        setSlideIndex(index)
        setShowGallery(true)
    };

    useEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape')
            setShowGallery(false)
    });

    useEventListener('scroll', () => {
        setTimeout(() => {
            if (!galleryLocked)
                setShowGallery(false)
        })
    });

    const new_children = iterateChildren(children, galleryCallback, sources);

    const image = router.query.image

    if (image && destroyedSwiper) {
        let index = sources.findIndex(source => source.src.src.split(".")[0].split("/").pop() === image)
        destroyedSwiper = false;

        setTimeout(() => {
            setSlideIndex(index)
            setShowGallery(true)
        }, 100)
    }

    const changeSlide = (src: string) => {
        const name = src.split(".")[0].split("/").pop()
        router.push(`?image=${name}`, undefined, { shallow: true, scroll: false });
    }

    return (
        <>
            {showGallery && <>
                <Container disableGutters maxWidth={false} sx={{
                    position: "fixed",
                    zIndex: "1997",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    width: "100vw",
                }}>
                    <Container disableGutters maxWidth={false} sx={{
                        position: "fixed",
                        zIndex: "1998",
                        height: "100vh",
                        width: "100vw",
                        backgroundColor: "rgba(0,0,0,0.4)"
                    }} onClick={() => setShowGallery(false)}>
                    </Container>

                    <Box sx={{
                        width: "100%",
                        "& .swiper-button-prev": {
                            color: swiper_button_color,
                        },
                        "& .swiper-button-next": {
                            color: swiper_button_color,
                        },
                        "& .swiper-pagination-bullet-active": {
                            backgroundColor: swiper_button_color,
                        }
                    }}>
                        <Swiper
                            modules={[Navigation, Pagination, Scrollbar, A11y, Keyboard]}
                            centeredSlides={true}
                            style={{ zIndex: "2000" }}
                            pagination={showSubtitles ? { clickable: true } : false}
                            navigation={true}
                            keyboard={{ enabled: true, pageUpDown: true }}
                            autoHeight
                            initialSlide={slideIndex}
                            onSlideChange={(swiper) => changeSlide(sources[swiper.activeIndex].src.src)}
                            onSwiper={(swiper) => changeSlide(sources[swiper.activeIndex].src.src)}
                            onDestroy={() => {
                                router.push(``, undefined, { shallow: true, scroll: false });
                                destroyedSwiper = true;
                            }}
                        >
                            {sources.map((source) => (
                                <SwiperSlide key={source.src.src}>
                                    <Box
                                        onClick={() => setShowSubtitles(!showSubtitles)}
                                        sx={{
                                            zIndex: "1999",
                                            display: "flex",
                                            justifyContent: "center",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            maxWidth: "100%",
                                            maxHeight: "100vh",
                                            "& img": {
                                                borderRadius: "17px",
                                                objectFit: "scale-down",
                                            }
                                        }}>
                                        <NextjsImage
                                            src={source.src}
                                            alt={source.caption}
                                            priority
                                        />
                                        {showSubtitles ? <Container sx={{
                                            backgroundColor: "white",
                                            padding: "20px",
                                            borderRadius: "7px",
                                            marginTop: "5px",
                                            paddingBottom: "40px",
                                        }}>
                                            <Typography variant="caption" component="p" align="center">
                                                {source.caption}
                                            </Typography>
                                        </Container> : null}
                                    </Box>
                                </SwiperSlide>))}
                        </Swiper>
                    </Box>
                </Container>
            </>
            }

            {new_children}
        </>
    );
}

export default Gallery;