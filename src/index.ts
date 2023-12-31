import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    timeout,
    ProgressivePlugin,
    TonemapPlugin,
    SSRPlugin,
    SSAOPlugin,
    DiamondPlugin,
    FrameFadePlugin,
    GLTFAnimationPlugin,
    GroundPlugin,
    BloomPlugin,
    TemporalAAPlugin,
    AnisotropyPlugin,
    GammaCorrectionPlugin,
    mobileAndTabletCheck,
    addBasePlugins,
    ITexture, TweakpaneUiPlugin, AssetManagerBasicPopupPlugin, CanvasSnipperPlugin,

    IViewerPlugin,
    AssetImporter,

    // Color, // Import THREE.js internals
    // Texture, // Import THREE.js internals
} from "webgi";
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Cursor from './utils/cursor';
// import Menu from './utils/menu'

gsap.registerPlugin(ScrollTrigger)


const cursor = new Cursor(document.querySelector('.cursor'));
//@ts-ignore
[...document.querySelectorAll('button')].forEach(el => {
    //@ts-ignore
    el.addEventListener('mouseenter', () => cursor.emit('enter'));
    //@ts-ignore
    el.addEventListener('mouseleave', () => cursor.emit('leave'));
});

//@ts-ignore
[...document.querySelectorAll('.button-menu')].forEach(el => {
    //@ts-ignore
    el.addEventListener('mouseenter', () => cursor.emit('enterNav'));
    //@ts-ignore
    el.addEventListener('mouseleave', () => cursor.emit('leave'));
});

const menu = document.getElementById('menu')
const drawer = document.querySelector('.menu-drawer') as HTMLElement 

menu?.addEventListener('click', () => {
    if(menu.classList.contains('active')) {
			closeMenu()
		} else {
			openMenu()
    }
})

const openMenu = () => {
	menu?.classList.add('active')
	drawer?.classList.add('active')
	document.body.style.overflowY = 'hidden'
	document.body.classList.add('overlay')
	gsap.to('.menu-drawer .anim-btn', {
		opacity: 1,
		duration: .3,
		y: 0,
		stagger: 0.1
	})
}

const closeMenu = () => {
	menu?.classList.remove('active')
	drawer?.classList.remove('active')
	document.body.style.overflowY = 'auto'
	document.body.classList.remove('overlay')
		gsap.to('.anim-btn', {
			opacity: 0,
			delay: 0.3,
			y: -100,
			stagger: 0.1
		})
}

async function setupViewer(){

    // Initialize the viewer
    const viewer = new ViewerApp({
        canvas: document.getElementById('webgi-canvas') as HTMLCanvasElement,
        //useRgbm make my canvas transluscent
        useRgbm: false,
    })
    const manager = await viewer.addPlugin(AssetManagerPlugin)
    const camera = viewer.scene.activeCamera
    const position = camera.position
    const target = camera.target
    // Add plugins individually.
    await viewer.addPlugin(GBufferPlugin)
    await viewer.addPlugin(new ProgressivePlugin(32))
    await viewer.addPlugin(new TonemapPlugin(!viewer.useRgbm))
    await viewer.addPlugin(GammaCorrectionPlugin)
    await viewer.addPlugin(SSRPlugin)
    await viewer.addPlugin(SSAOPlugin)
    // Add more plugins not available in base, like CanvasSnipperPlugin which has helpers to download an image of the canvas.
    await viewer.addPlugin(CanvasSnipperPlugin)

    // This must be called once after all plugins are added.
    viewer.renderer.refreshPipeline()
    //Mobile
    const isMobile = mobileAndTabletCheck()
    console.log('isMobile: ', isMobile)
    //Loader
    const importer = manager.importer as AssetImporter

    importer.addEventListener('onProgress', (e) => {
        const progressRatio = (e.loaded / e.total)
        // console.log('progressRatio: ', progressRatio * 100)

        document.querySelector('.progress')?.setAttribute('style', `width: ${progressRatio * 100}%`)
    })

		importer.addEventListener('onLoad', () => {
			gsap.to('.loader', {
				x: '100%',
				ease: 'power4.inOut',
				delay: 1,
				duration: 0.5, 
				onComplete: () => {
					document.body.style.overflowY = 'auto'
				}
			})
		})

		const footer = document.getElementById('footer') as HTMLElement

    // Import and add a GLB file.
    await viewer.load("./assets/megaphone_2.glb")
    // Add some UI for tweak and testing.
    // const uiPlugin = await viewer.addPlugin(TweakpaneUiPlugin)
    // Add plugins to the UI to see their settings.
    // uiPlugin.setupPlugins<IViewerPlugin>(TonemapPlugin, CanvasSnipperPlugin)
    let needsUpdate = true

    const onUpdate = ()=> {
        needsUpdate = true
        viewer.renderer.resetShadows()
				// removeEventListener('scroll', scrollPosition)
    }

		const getStopModelPosition = ():number => {
			let bodyHeight = document.body.offsetHeight
			let windowHeight = window.innerHeight
			let footerHeight = footer.offsetHeight
			
			return bodyHeight - footerHeight - windowHeight
		}

		const stopFixedScene = () => {
			const footerExist = checkVisible(footer)
			
			if (footerExist) {
				viewerDom.style.position = 'absolute'
				canvasDom.style.position = 'absolute'
				viewerDom.style.top = `${getStopModelPosition()}px`
			} else {
					viewerDom.style.position = 'fixed'
					canvasDom.style.position = 'fixed'
					viewerDom.style.top = 'inherit' 
			} 
		}

    viewer.addEventListener('preFrame', () => {
        if(needsUpdate) {
            camera.positionUpdated(true)
            camera.targetUpdated(true)
            needsUpdate = false
        }
    })

    // Fix animation camera shake problem
    viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})
    
		window.scrollTo(0,0)

		if(isMobile){
			position.set(-7.57, -2.75, -2.99)
			target.set(-0.51, 0.19, 0.11)
		}

		onUpdate()

		const viewerDom = document.getElementById('webgi-canvas-container') as HTMLElement
		const canvasDom = document.getElementById('webgi-canvas') as HTMLElement

		//@ts-ignore
		const checkVisible = (elm) => {
			// console.log(elm)
			var rect = elm.getBoundingClientRect();
		 console.log(rect)
			var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
			return !(rect.bottom  < 0 || rect.top - viewHeight >= 0);
		}


    const setupScrollAnimation =()=> {
        const tl = gsap.timeline()

				isMobile && (
					tl.to('.third--section .center-section', {
						opacity: 0,
						yPercent: '150', 
					})
				)

        //Second section
        tl.to(position, {
						x: isMobile ? -8.94 : 4.58, 
            y: isMobile ? -2.46 : 0.52,
            z: isMobile ? 2.31 : 4.02, 
            scrollTrigger: { 
                trigger: '.second--section',
                start: "top bottom",
                end: 'top top',
                scrub: true,
                immediateRender:false
            },
            onUpdate,
						onComplete: () => {
							window.removeEventListener('scroll', stopFixedScene)
						}
        })
        tl.to(target, {
            x: isMobile ? -0.96 : -0.86, 
            y: isMobile ? -0.33 : -0.05,
            z: isMobile ? -0.10 : 1.04, 
            scrollTrigger: { 
                trigger: '.second--section',
                start: "top bottom",
                end: 'top top',
                scrub: true,
                immediateRender:false
            },
        })
        tl.to('#webgi-canvas-container', {
            opacity: isMobile ? 1 : 0,
            scrollTrigger: { 
                trigger: '.second--section',
                start: "150",
                end: '400',
                scrub: true,
                immediateRender:false
            },
        })
        tl.to('#webgi-canvas-container', {
            opacity: 1,
            scrollTrigger: { 
                trigger: '.second--section',
                start: "400",
                end: '500',
                scrub: true,
                immediateRender:false
            },
        })
        tl.to('.title-first', {
            xPercent: '150', 
            opacity: isMobile ? 1 : 0,
            scrollTrigger: { 
                trigger: '.second--section',
                start: "top bottom",
                end: 'top top',
                scrub: true,
                immediateRender:false
            },
            onUpdate,
        })

         //Last section
         
         tl.to(position, {
            x: isMobile ? -5.00 : -5.28, 
            y: isMobile ? -5.23 : -0.19,
            z: isMobile ? -0.00 : -3.35, 
            scrollTrigger: { 
                trigger: '.third--section',
                start: "top bottom",
                end: 'top top',
                scrub: true,
                immediateRender:false
            },
            onUpdate,
        })
        tl.to(target, {
            x: isMobile ? -1.18 : -0.71, 
            y: isMobile ? 0.18 : 0.16,
            z: isMobile ? -0.01 : 0.88, 
            scrollTrigger: { 
                trigger: '.third--section',
                start: "top bottom",
                end: 'top top',
                scrub: true,
                immediateRender:false
            },
						onComplete: () => {
							window.addEventListener('scroll', stopFixedScene)
						}
        })
				isMobile && (
					tl.to('.second--section', {
							xPercent: '-150', 
							opacity: 0,
							scrollTrigger: { 
									trigger: '.third--section',
									start: "top bottom",
									end: 'top center',
									scrub: 1,
									immediateRender:false
							},
							onUpdate,
					})
				)
        tl.to('#webgi-canvas-container', {
            opacity: isMobile ? 1 : 0,
            scrollTrigger: { 
                trigger: '.third--section',
                start: "top bottom",
                end: 'top 50%',
                // markers: true,
                scrub: true,
                immediateRender:false
            },
        })
        tl.to('#webgi-canvas-container', {
            opacity: 1,
            scrollTrigger: { 
                trigger: '.third--section',
                start: "top 50%",
                end: 'top 40%',
                scrub: true,
                immediateRender:false
            },
        })
				isMobile && (
					tl.to('.third--section .center-section', {
						opacity: 1,
						yPercent: '0', 
						scrollTrigger: { 
								trigger: '.third--section',
								start: "top bottom",
								end: 'top top',
								scrub: true,
								immediateRender:false
						},
					})
				)
    }
    
    setupScrollAnimation()

		const contentPage = document.querySelector('.general-container') as HTMLElement 
		const exitButton = document.querySelector('.exit-button') as HTMLElement

		document.querySelector('.customize-btn')?.addEventListener('click', () => {
			// Make scroll to top
			// window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
			contentPage.style.visibility = 'hidden'
			viewerDom.style.pointerEvents = 'all'
			document.body.style.cursor = 'grab'
			exitButton.style.visibility = 'visible'
			
			window.scrollTo(0, getStopModelPosition())

			gsap.to(position, {
				x: -7.20, 
				y: -1.12,
				z: 5.91,
				duration: 2,
				ease: 'power3.inOut',
				onUpdate,
			})
			gsap.to(target, {
					x: -0.50, 
					y: 0.00,
					z: -0.04, 
					duration: 2,
					ease: 'power3.inOut',
					onUpdate,
					onComplete: enableControllers
			})
		})

		exitButton?.addEventListener('click', () => {
			exitButton.style.visibility = 'hidden'
			contentPage.style.visibility = 'visible'
			viewerDom.style.pointerEvents = 'none'
			document.body.style.cursor = 'none'
			viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})
			gsap.to(position, {
				x: isMobile ? -5.00 : -5.28, 
				y: isMobile ? -5.23 : -0.19,
				z: isMobile ? -0.00 : -3.35, 
				duration: 2,
				ease: 'power3.inOut',
				onUpdate,
			})
			gsap.to(target, {
					x: isMobile ? -1.18 : -0.71, 
					y: isMobile ? 0.18 : 0.16,
					z: isMobile ? -0.01 : 0.88, 
					duration: 2,
					ease: 'power3.inOut',
			})
		})

		const enableControllers = () => {
			viewer.scene.activeCamera.setCameraOptions({controlsEnabled: true})	
		}
}


setupViewer()
