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

    addBasePlugins,
    ITexture, TweakpaneUiPlugin, AssetManagerBasicPopupPlugin, CanvasSnipperPlugin,

    IViewerPlugin,
    AssetImporter,

    // Color, // Import THREE.js internals
    // Texture, // Import THREE.js internals
} from "webgi";
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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
    //Loader
    const importer = manager.importer as AssetImporter

    importer.addEventListener('onProgress', (e) => {
        const progressRatio = (e.loaded / e.total)
        console.log('progressRatio: ', progressRatio * 100)

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

    onUpdate()

    const setupScrollAnimation =()=> {
        const tl = gsap.timeline()
    
        //Second section
        tl.to(position, {
            x: 4.58, 
            y: 0.52,
            z: 4.02, 
            scrollTrigger: { 
                trigger: '.second--section',
                start: "top bottom",
                end: 'top top',
                scrub: true,
                immediateRender:false
            },
            onUpdate,
        })
        tl.to('.title-first', {
            xPercent: '150', 
            opacity: 0,
            scrollTrigger: { 
                trigger: '.second--section',
                start: "top bottom",
                end: 'top top',
                scrub: true,
                immediateRender:false
            },
            onUpdate,
        })
        tl.to(target, {
            x: -0.86, 
            y: -0.05,
            z: 1.04, 
            scrollTrigger: { 
                trigger: '.second--section',
                start: "top bottom",
                end: 'top top',
                scrub: true,
                immediateRender:false
            },
        })

         //Last section
         tl.to(position, {
            x: -5.28, 
            y: -0.19,
            z: -3.35, 
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
            x: -0.71, 
            y: 0.16,
            z: 0.88, 
            scrollTrigger: { 
                trigger: '.third--section',
                start: "top bottom",
                end: 'top top',
                scrub: true,
                immediateRender:false
            },
        })
        
    }
    
    setupScrollAnimation()

		const contentPage = document.querySelector('.general-container') as HTMLElement 
		const viewerDom = document.getElementById('webgi-canvas-container') as HTMLElement
		const exitButton = document.querySelector('.exit-button') as HTMLElement

		document.querySelector('.customize-btn')?.addEventListener('click', () => {
			// Make scroll to top
			// window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
			contentPage.style.visibility = 'hidden'
			viewerDom.style.pointerEvents = 'all'
			document.body.style.cursor = 'grab'
			exitButton.style.visibility = 'visible'

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
			document.body.style.cursor = 'cursor'
			viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})
			gsap.to(position, {
				x: -5.28, 
				y: -0.19,
				z: -3.35,
				duration: 2,
				ease: 'power3.inOut',
				onUpdate,
			})
			gsap.to(target, {
					x: -0.71, 
					y: 0.16,
					z: 0.88, 
					duration: 2,
					ease: 'power3.inOut',
			})
		})

		const enableControllers = () => {
			viewer.scene.activeCamera.setCameraOptions({controlsEnabled: true})	
		}
}


setupViewer()
