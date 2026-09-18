import { type ComponentType, useState } from "react";
import { BorderBeam } from "border-beam";
import { ThinkingOrb } from "thinking-orbs";
import { Liquid } from "liquid-gooey";
import { MetalFx } from "metal-fx";
import LibraryImage from "../library-image";
import "../vendor/beautiful/scoped.css";
import { FadeIn as Amicro0 } from "../vendor/amicro/fade-in";
import { FadeUp as Amicro1 } from "../vendor/amicro/fade-up";
import { FadeDown as Amicro2 } from "../vendor/amicro/fade-down";
import { SlideLeft as Amicro3 } from "../vendor/amicro/slide-left";
import { SlideRight as Amicro4 } from "../vendor/amicro/slide-right";
import { ScaleIn as Amicro5 } from "../vendor/amicro/scale-in";
import { ZoomIn as Amicro6 } from "../vendor/amicro/zoom-in";
import { TextReveal as Amicro7 } from "../vendor/amicro/text-reveal";
import { WordReveal as Amicro8 } from "../vendor/amicro/word-reveal";
import { BlurText as Amicro9 } from "../vendor/amicro/blur-text";
import { CharacterStagger as Amicro10 } from "../vendor/amicro/character-stagger";
import { CardHover as Amicro11 } from "../vendor/amicro/card-hover";
import { TiltCard as Amicro12 } from "../vendor/amicro/tilt-card";
import { MagneticButton as Amicro13 } from "../vendor/amicro/magnetic-button";
import { GlowButton as Amicro14 } from "../vendor/amicro/glow-button";
import { CursorTrail as Amicro15 } from "../vendor/amicro/cursor-trail";
import { Spotlight as Amicro16 } from "../vendor/amicro/spotlight";
import { MouseFollow as Amicro17 } from "../vendor/amicro/mouse-follow";
import { ScrollReveal as Amicro18 } from "../vendor/amicro/scroll-reveal";
import { ProgressIndicator as Amicro19 } from "../vendor/amicro/progress-indicator";
import { StickyReveal as Amicro20 } from "../vendor/amicro/sticky-reveal";
import { Skeleton as Amicro21 } from "../vendor/amicro/skeleton";
import { Pulse as Amicro22 } from "../vendor/amicro/pulse";
import { MorphLoader as Amicro23 } from "../vendor/amicro/morph-loader";
import { AccordionLoader as Amicro24 } from "../vendor/amicro/accordion-loader";
import { AppIconLoad as Amicro25 } from "../vendor/amicro/app-icon-load";
import { AppleBreathe as Amicro26 } from "../vendor/amicro/apple-breathe";
import { AppleEqualizer as Amicro27 } from "../vendor/amicro/apple-equalizer";
import { AppleIconMorph as Amicro28 } from "../vendor/amicro/apple-icon-morph";
import { ApplePulseDots as Amicro29 } from "../vendor/amicro/apple-pulse-dots";
import { AppleScalePulse as Amicro30 } from "../vendor/amicro/apple-scale-pulse";
import { AppleSoundWave as Amicro31 } from "../vendor/amicro/apple-sound-wave";
import { AppleTextReveal as Amicro32 } from "../vendor/amicro/apple-text-reveal";
import { AppleUnlock as Amicro33 } from "../vendor/amicro/apple-unlock";
import { ArcTracer as Amicro34 } from "../vendor/amicro/arc-tracer";
import { BarCascade as Amicro35 } from "../vendor/amicro/bar-cascade";
import { BarSweep as Amicro36 } from "../vendor/amicro/bar-sweep";
import { BobbingDots as Amicro37 } from "../vendor/amicro/bobbing-dots";
import { BounceDots as Amicro38 } from "../vendor/amicro/bounce-dots";
import { BouncingBars as Amicro39 } from "../vendor/amicro/bouncing-bars";
import { BouncingDots as Amicro40 } from "../vendor/amicro/bouncing-dots";
import { BouncingLines as Amicro41 } from "../vendor/amicro/bouncing-lines";
import { BouncingSquare as Amicro42 } from "../vendor/amicro/bouncing-square";
import { BreatheRing as Amicro43 } from "../vendor/amicro/breathe-ring";
import { BreathingGlow as Amicro44 } from "../vendor/amicro/breathing-glow";
import { BreathingSquare as Amicro45 } from "../vendor/amicro/breathing-square";
import { CircularBars as Amicro46 } from "../vendor/amicro/circular-bars";
import { ClassicSpinner as Amicro47 } from "../vendor/amicro/classic-spinner";
import { ClockSpinner as Amicro48 } from "../vendor/amicro/clock-spinner";
import { CometSpinner as Amicro49 } from "../vendor/amicro/comet-spinner";
import { ConcentricPulse as Amicro50 } from "../vendor/amicro/concentric-pulse";
import { ConcentricRing as Amicro51 } from "../vendor/amicro/concentric-ring";
import { ConcentricSquares as Amicro52 } from "../vendor/amicro/concentric-squares";
import { ConveyorLoop as Amicro53 } from "../vendor/amicro/conveyor-loop";
import { CrossSpinner as Amicro54 } from "../vendor/amicro/cross-spinner";
import { CubeFlipSpring as Amicro55 } from "../vendor/amicro/cube-flip-spring";
import { DashRing as Amicro56 } from "../vendor/amicro/dash-ring";
import { DashedSpiral as Amicro57 } from "../vendor/amicro/dashed-spiral";
import { DiamondGrid as Amicro58 } from "../vendor/amicro/diamond-grid";
import { DiamondRotateSpring as Amicro59 } from "../vendor/amicro/diamond-rotate-spring";
import { DotSpinner as Amicro60 } from "../vendor/amicro/dot-spinner";
import { DotsRing as Amicro61 } from "../vendor/amicro/dots-ring";
import { DoubleRing as Amicro62 } from "../vendor/amicro/double-ring";
import { DropDot as Amicro63 } from "../vendor/amicro/drop-dot";
import { DualArc as Amicro64 } from "../vendor/amicro/dual-arc";
import { DynamicIsland as Amicro65 } from "../vendor/amicro/dynamic-island";
import { ElasticBars as Amicro66 } from "../vendor/amicro/elastic-bars";
import { ElasticSquare as Amicro67 } from "../vendor/amicro/elastic-square";
import { ExpandingCross as Amicro68 } from "../vendor/amicro/expanding-cross";
import { FaceIDScan as Amicro69 } from "../vendor/amicro/face-id-scan";
import { FadeArc as Amicro70 } from "../vendor/amicro/fade-arc";
import { FadeDots as Amicro71 } from "../vendor/amicro/fade-dots";
import { FlipSquare as Amicro72 } from "../vendor/amicro/flip-square";
import { FloatingDiamonds as Amicro73 } from "../vendor/amicro/floating-diamonds";
import { FluidBars as Amicro74 } from "../vendor/amicro/fluid-bars";
import { FluidDiamond as Amicro75 } from "../vendor/amicro/fluid-diamond";
import { FluidDotOrbit as Amicro76 } from "../vendor/amicro/fluid-dot-orbit";
import { FluidSkeleton as Amicro77 } from "../vendor/amicro/fluid-skeleton";
import { Gears as Amicro78 } from "../vendor/amicro/gears";
import { GlassmorphicCard as Amicro79 } from "../vendor/amicro/glassmorphic-card";
import { GradientArc as Amicro80 } from "../vendor/amicro/gradient-arc";
import { GridDots as Amicro81 } from "../vendor/amicro/grid-dots";
import { HapticRing as Amicro82 } from "../vendor/amicro/haptic-ring";
import { Heartbeat as Amicro83 } from "../vendor/amicro/heartbeat";
import { HexagonSpinner as Amicro84 } from "../vendor/amicro/hexagon-spinner";
import { Hourglass as Amicro85 } from "../vendor/amicro/hourglass";
import { InfinityPath as Amicro86 } from "../vendor/amicro/infinity-path";
import { IntersectingRings as Amicro87 } from "../vendor/amicro/intersecting-rings";
import { IOSSpinner as Amicro88 } from "../vendor/amicro/ios-spinner";
import { LineSpinner as Amicro89 } from "../vendor/amicro/line-spinner";
import { LiquidDots as Amicro90 } from "../vendor/amicro/liquid-dots";
import { MacTerminal as Amicro91 } from "../vendor/amicro/mac-terminal";
import { MagneticDots as Amicro92 } from "../vendor/amicro/magnetic-dots";
import { MinimalTriangle as Amicro93 } from "../vendor/amicro/minimal-triangle";
import { MorphDotRing as Amicro94 } from "../vendor/amicro/morph-dot-ring";
import { MorphingBars as Amicro95 } from "../vendor/amicro/morphing-bars";
import { MorphingInfinity as Amicro96 } from "../vendor/amicro/morphing-infinity";
import { MorphingRing as Amicro97 } from "../vendor/amicro/morphing-ring";
import { MorphingShape as Amicro98 } from "../vendor/amicro/morphing-shape";
import { NewtonsCradle as Amicro99 } from "../vendor/amicro/newtons-cradle";
import { OffsetRings as Amicro100 } from "../vendor/amicro/offset-rings";
import { OrbitingCircles as Amicro101 } from "../vendor/amicro/orbiting-circles";
import { OrbitingDot as Amicro102 } from "../vendor/amicro/orbiting-dot";
import { OrigamiShape as Amicro103 } from "../vendor/amicro/origami-shape";
import { Pendulum as Amicro104 } from "../vendor/amicro/pendulum";
import { PulsatingDots as Amicro105 } from "../vendor/amicro/pulsating-dots";
import { PulseDot as Amicro106 } from "../vendor/amicro/pulse-dot";
import { PulseDots as Amicro107 } from "../vendor/amicro/pulse-dots";
import { PulseSquare as Amicro108 } from "../vendor/amicro/pulse-square";
import { PumpingHeart as Amicro109 } from "../vendor/amicro/pumping-heart";
import { RadarSweep as Amicro110 } from "../vendor/amicro/radar-sweep";
import { RingSweep as Amicro111 } from "../vendor/amicro/ring-sweep";
import { RippleEffect as Amicro112 } from "../vendor/amicro/ripple-effect";
import { RotatingCross as Amicro113 } from "../vendor/amicro/rotating-cross";
import { RotatingTriangle as Amicro114 } from "../vendor/amicro/rotating-triangle";
import { ShapeShiftGrid as Amicro115 } from "../vendor/amicro/shape-shift-grid";
import { ShimmerLine as Amicro116 } from "../vendor/amicro/shimmer-line";
import { SiriWave as Amicro117 } from "../vendor/amicro/siri-wave";
import { SkeletonLoader as Amicro118 } from "../vendor/amicro/skeleton-loader";
import { SlidingBars as Amicro119 } from "../vendor/amicro/sliding-bars";
import { SmoothDotShift as Amicro120 } from "../vendor/amicro/smooth-dot-shift";
import { SmoothRing as Amicro121 } from "../vendor/amicro/smooth-ring";
import { SmoothRoundedSquare as Amicro122 } from "../vendor/amicro/smooth-rounded-square";
import { SpinningSquares as Amicro123 } from "../vendor/amicro/spinning-squares";
import { SpiralSpinner as Amicro124 } from "../vendor/amicro/spiral-spinner";
import { SpringBars as Amicro125 } from "../vendor/amicro/spring-bars";
import { SpringDotMatrix as Amicro126 } from "../vendor/amicro/spring-dot-matrix";
import { SpringHexagon as Amicro127 } from "../vendor/amicro/spring-hexagon";
import { SpringRingExpand as Amicro128 } from "../vendor/amicro/spring-ring-expand";
import { SpringTextPop as Amicro129 } from "../vendor/amicro/spring-text-pop";
import { SquareAccordion as Amicro130 } from "../vendor/amicro/square-accordion";
import { SquareGrid as Amicro131 } from "../vendor/amicro/square-grid";
import { SquareSnake as Amicro132 } from "../vendor/amicro/square-snake";
import { SquareSpinner as Amicro133 } from "../vendor/amicro/square-spinner";
import { StackedBarPulse as Amicro134 } from "../vendor/amicro/stacked-bar-pulse";
import { SwappingDots as Amicro135 } from "../vendor/amicro/swapping-dots";
import { SwirlingSpinner as Amicro136 } from "../vendor/amicro/swirling-spinner";
import { SymmetricWave as Amicro137 } from "../vendor/amicro/symmetric-wave";
import { TerminalLoader as Amicro138 } from "../vendor/amicro/terminal-loader";
import { TextBlink as Amicro139 } from "../vendor/amicro/text-blink";
import { TextDots as Amicro140 } from "../vendor/amicro/text-dots";
import { TextMorph as Amicro141 } from "../vendor/amicro/text-morph";
import { TextShimmerWave as Amicro142 } from "../vendor/amicro/text-shimmer-wave";
import { TextShimmer as Amicro143 } from "../vendor/amicro/text-shimmer";
import { TrailingDots as Amicro144 } from "../vendor/amicro/trailing-dots";
import { TripleDotSpinner as Amicro145 } from "../vendor/amicro/triple-dot-spinner";
import { TwinOrbit as Amicro146 } from "../vendor/amicro/twin-orbit";
import { TypingIndicator as Amicro147 } from "../vendor/amicro/typing-indicator";
import { Typing as Amicro148 } from "../vendor/amicro/typing";
import { WanderingCube as Amicro149 } from "../vendor/amicro/wandering-cube";
import { WatchSpinner as Amicro150 } from "../vendor/amicro/watch-spinner";
import { WaveDots as Amicro151 } from "../vendor/amicro/wave-dots";
import { WavePhysicsLoader as Amicro152 } from "../vendor/amicro/wave-physics-loader";
import { WaveformLoader as Amicro153 } from "../vendor/amicro/waveform-loader";
import { ZigZagPulse as Amicro154 } from "../vendor/amicro/zig-zag-pulse";
import Beautiful155 from "../vendor/beautiful/components/primitives/LoadingState";
import Beautiful156 from "../vendor/beautiful/components/primitives/ThinkingState";
import Beautiful157 from "../vendor/beautiful/components/primitives/StreamingText";
import Beautiful158 from "../vendor/beautiful/components/primitives/ApprovalCard";
import Beautiful159 from "../vendor/beautiful/components/primitives/ToolChips";
import Beautiful160 from "../vendor/beautiful/components/primitives/TaskRows";
import Beautiful161 from "../vendor/beautiful/components/primitives/ChatComposer";
import Beautiful162 from "../vendor/beautiful/components/primitives/PromptBar";
import Beautiful163 from "../vendor/beautiful/components/primitives/RecommendationCard";
import Beautiful164 from "../vendor/beautiful/components/primitives/ContextCards";
import Beautiful165 from "../vendor/beautiful/components/primitives/DiffTable";
import Beautiful166 from "../vendor/beautiful/components/primitives/RecordsTable";
import Beautiful167 from "../vendor/beautiful/components/primitives/FilterTable";
import Beautiful168 from "../vendor/beautiful/components/primitives/SidebarNav";
import Beautiful169 from "../vendor/beautiful/components/primitives/SearchList";
import Beautiful170 from "../vendor/beautiful/components/primitives/Flowchart";
import Beautiful171 from "../vendor/beautiful/components/primitives/InsightCards";
import Beautiful172 from "../vendor/beautiful/components/primitives/CodeBlock";
import Beautiful173 from "../vendor/beautiful/components/primitives/FineTuneCard";
import Beautiful174 from "../vendor/beautiful/components/primitives/SelectionActions";
import Beautiful175 from "../vendor/beautiful/agent-screen";
function GooeyDemo({dark}: {dark?: boolean}) {const [open,setOpen]=useState(false);return <div style={{height:180,width:260,display:"grid",placeItems:"center"}}><Liquid fill={dark?"#f4f4f5":"#27272a"} blur={6} contrast={18}><Liquid.Item x={open?-52:0} y={open?-40:0} transition="bouncy"><button style={{width:44,height:44,borderRadius:22,color:dark?"#18181b":"white"}} onClick={()=>setOpen(!open)} aria-label="First action">1</button></Liquid.Item><Liquid.Item x={open?52:0} y={open?-40:0} transition="bouncy"><button style={{width:44,height:44,borderRadius:22,color:dark?"#18181b":"white"}} onClick={()=>setOpen(!open)} aria-label="Second action">2</button></Liquid.Item><Liquid.Item><button aria-label="Toggle liquid menu" onClick={()=>setOpen(!open)} style={{width:48,height:48,borderRadius:24,color:dark?"#18181b":"white"}}>{open?"−":"+"}</button></Liquid.Item></Liquid></div>;}
export const expressivePreviews: Record<string, ComponentType<{dark?:boolean}>> = {
"amicro:fade-in": () => <Amicro0><span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span></Amicro0>,
"amicro:fade-up": () => <Amicro1><span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span></Amicro1>,
"amicro:fade-down": () => <Amicro2><span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span></Amicro2>,
"amicro:slide-left": () => <Amicro3><span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span></Amicro3>,
"amicro:slide-right": () => <Amicro4><span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span></Amicro4>,
"amicro:scale-in": () => <Amicro5><span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span></Amicro5>,
"amicro:zoom-in": () => <Amicro6><span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span></Amicro6>,
"amicro:text-reveal": () => <Amicro7 text="Ideas come to life" className="text-2xl font-medium" />,
"amicro:word-reveal": () => <Amicro8 text="Ideas come to life" className="text-2xl font-medium" />,
"amicro:blur-text": () => <Amicro9 text="Ideas come to life" className="text-2xl font-medium" />,
"amicro:character-stagger": () => <Amicro10 text="Ideas come to life" className="text-2xl font-medium" />,
"amicro:card-hover": () => <Amicro11 items={[{id:"one",title:"Explore",description:"Hover to discover the motion."},{id:"two",title:"Create",description:"Build something meaningful."}]} />,
"amicro:tilt-card": () => <Amicro12><span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span></Amicro12>,
"amicro:magnetic-button": () => <Amicro13><span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span></Amicro13>,
"amicro:glow-button": () => <Amicro14><span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span></Amicro14>,
"amicro:cursor-trail": () => <div style={{height:180,width:280,display:"grid",placeItems:"center"}}><span>Move your pointer here</span><Amicro15 /></div>,
"amicro:spotlight": () => <Amicro16><span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span></Amicro16>,
"amicro:mouse-follow": () => <div style={{height:180,width:280,display:"grid",placeItems:"center"}}><span>Move your pointer here</span><Amicro17><div style={{width:40,height:40,borderRadius:20,background:"#6366f1"}} /></Amicro17></div>,
"amicro:scroll-reveal": () => <Amicro18><span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span></Amicro18>,
"amicro:progress-indicator": () => <div style={{height:650,padding:32}}><Amicro19 /><p>Scroll down to see progress</p><p style={{marginTop:450}}>You reached the end</p></div>,
"amicro:sticky-reveal": () => <Amicro20 content={[{title:"Discover",description:"Scroll through the preview to reveal each step."},{title:"Make it yours",description:"Original motion, ready for your project."}]} />,
"amicro:skeleton": () => <Amicro21 className="h-28 w-64 rounded-xl" />,
"amicro:pulse": () => <Amicro22 />,
"amicro:morph-loader": () => <Amicro23 />,
"amicro:accordion-loader": () => <Amicro24 />,
"amicro:app-icon-load": () => <Amicro25 />,
"amicro:apple-breathe": () => <Amicro26 />,
"amicro:apple-equalizer": () => <Amicro27 />,
"amicro:apple-icon-morph": () => <Amicro28 />,
"amicro:apple-pulse-dots": () => <Amicro29 />,
"amicro:apple-scale-pulse": () => <Amicro30 />,
"amicro:apple-sound-wave": () => <Amicro31 />,
"amicro:apple-text-reveal": () => <Amicro32 />,
"amicro:apple-unlock": () => <Amicro33 />,
"amicro:arc-tracer": () => <Amicro34 />,
"amicro:bar-cascade": () => <Amicro35 />,
"amicro:bar-sweep": () => <Amicro36 />,
"amicro:bobbing-dots": () => <Amicro37 />,
"amicro:bounce-dots": () => <Amicro38 />,
"amicro:bouncing-bars": () => <Amicro39 />,
"amicro:bouncing-dots": () => <Amicro40 />,
"amicro:bouncing-lines": () => <Amicro41 />,
"amicro:bouncing-square": () => <Amicro42 />,
"amicro:breathe-ring": () => <Amicro43 />,
"amicro:breathing-glow": () => <Amicro44 />,
"amicro:breathing-square": () => <Amicro45 />,
"amicro:circular-bars": () => <Amicro46 />,
"amicro:classic-spinner": () => <Amicro47 />,
"amicro:clock-spinner": () => <Amicro48 />,
"amicro:comet-spinner": () => <Amicro49 />,
"amicro:concentric-pulse": () => <Amicro50 />,
"amicro:concentric-ring": () => <Amicro51 />,
"amicro:concentric-squares": () => <Amicro52 />,
"amicro:conveyor-loop": () => <Amicro53 />,
"amicro:cross-spinner": () => <Amicro54 />,
"amicro:cube-flip-spring": () => <Amicro55 />,
"amicro:dash-ring": () => <Amicro56 />,
"amicro:dashed-spiral": () => <Amicro57 />,
"amicro:diamond-grid": () => <Amicro58 />,
"amicro:diamond-rotate-spring": () => <Amicro59 />,
"amicro:dot-spinner": () => <Amicro60 />,
"amicro:dots-ring": () => <Amicro61 />,
"amicro:double-ring": () => <Amicro62 />,
"amicro:drop-dot": () => <Amicro63 />,
"amicro:dual-arc": () => <Amicro64 />,
"amicro:dynamic-island": () => <Amicro65 />,
"amicro:elastic-bars": () => <Amicro66 />,
"amicro:elastic-square": () => <Amicro67 />,
"amicro:expanding-cross": () => <Amicro68 />,
"amicro:face-id-scan": () => <Amicro69 />,
"amicro:fade-arc": () => <Amicro70 />,
"amicro:fade-dots": () => <Amicro71 />,
"amicro:flip-square": () => <Amicro72 />,
"amicro:floating-diamonds": () => <Amicro73 />,
"amicro:fluid-bars": () => <Amicro74 />,
"amicro:fluid-diamond": () => <Amicro75 />,
"amicro:fluid-dot-orbit": () => <Amicro76 />,
"amicro:fluid-skeleton": () => <Amicro77 />,
"amicro:gears": () => <Amicro78 />,
"amicro:glassmorphic-card": () => <Amicro79 />,
"amicro:gradient-arc": () => <Amicro80 />,
"amicro:grid-dots": () => <Amicro81 />,
"amicro:haptic-ring": () => <Amicro82 />,
"amicro:heartbeat": () => <Amicro83 />,
"amicro:hexagon-spinner": () => <Amicro84 />,
"amicro:hourglass": () => <Amicro85 />,
"amicro:infinity-path": () => <Amicro86 />,
"amicro:intersecting-rings": () => <Amicro87 />,
"amicro:ios-spinner": () => <Amicro88 />,
"amicro:line-spinner": () => <Amicro89 />,
"amicro:liquid-dots": () => <Amicro90 />,
"amicro:mac-terminal": () => <Amicro91 />,
"amicro:magnetic-dots": () => <Amicro92 />,
"amicro:minimal-triangle": () => <Amicro93 />,
"amicro:morph-dot-ring": () => <Amicro94 />,
"amicro:morphing-bars": () => <Amicro95 />,
"amicro:morphing-infinity": () => <Amicro96 />,
"amicro:morphing-ring": () => <Amicro97 />,
"amicro:morphing-shape": () => <Amicro98 />,
"amicro:newtons-cradle": () => <Amicro99 />,
"amicro:offset-rings": () => <Amicro100 />,
"amicro:orbiting-circles": () => <Amicro101 />,
"amicro:orbiting-dot": () => <Amicro102 />,
"amicro:origami-shape": () => <Amicro103 />,
"amicro:pendulum": () => <Amicro104 />,
"amicro:pulsating-dots": () => <Amicro105 />,
"amicro:pulse-dot": () => <Amicro106 />,
"amicro:pulse-dots": () => <Amicro107 />,
"amicro:pulse-square": () => <Amicro108 />,
"amicro:pumping-heart": () => <Amicro109 />,
"amicro:radar-sweep": () => <Amicro110 />,
"amicro:ring-sweep": () => <Amicro111 />,
"amicro:ripple-effect": () => <Amicro112 />,
"amicro:rotating-cross": () => <Amicro113 />,
"amicro:rotating-triangle": () => <Amicro114 />,
"amicro:shape-shift-grid": () => <Amicro115 />,
"amicro:shimmer-line": () => <Amicro116 />,
"amicro:siri-wave": () => <Amicro117 />,
"amicro:skeleton-loader": () => <Amicro118 />,
"amicro:sliding-bars": () => <Amicro119 />,
"amicro:smooth-dot-shift": () => <Amicro120 />,
"amicro:smooth-ring": () => <Amicro121 />,
"amicro:smooth-rounded-square": () => <Amicro122 />,
"amicro:spinning-squares": () => <Amicro123 />,
"amicro:spiral-spinner": () => <Amicro124 />,
"amicro:spring-bars": () => <Amicro125 />,
"amicro:spring-dot-matrix": () => <Amicro126 />,
"amicro:spring-hexagon": () => <Amicro127 />,
"amicro:spring-ring-expand": () => <Amicro128 />,
"amicro:spring-text-pop": () => <Amicro129 />,
"amicro:square-accordion": () => <Amicro130 />,
"amicro:square-grid": () => <Amicro131 />,
"amicro:square-snake": () => <Amicro132 />,
"amicro:square-spinner": () => <Amicro133 />,
"amicro:stacked-bar-pulse": () => <Amicro134 />,
"amicro:swapping-dots": () => <Amicro135 />,
"amicro:swirling-spinner": () => <Amicro136 />,
"amicro:symmetric-wave": () => <Amicro137 />,
"amicro:terminal-loader": () => <Amicro138 />,
"amicro:text-blink": () => <Amicro139 />,
"amicro:text-dots": () => <Amicro140 />,
"amicro:text-morph": () => <Amicro141 />,
"amicro:text-shimmer-wave": () => <Amicro142 />,
"amicro:text-shimmer": () => <Amicro143 />,
"amicro:trailing-dots": () => <Amicro144 />,
"amicro:triple-dot-spinner": () => <Amicro145 />,
"amicro:twin-orbit": () => <Amicro146 />,
"amicro:typing-indicator": () => <Amicro147 />,
"amicro:typing": () => <Amicro148 />,
"amicro:wandering-cube": () => <Amicro149 />,
"amicro:watch-spinner": () => <Amicro150 />,
"amicro:wave-dots": () => <Amicro151 />,
"amicro:wave-physics-loader": () => <Amicro152 />,
"amicro:waveform-loader": () => <Amicro153 />,
"amicro:zig-zag-pulse": () => <Amicro154 />,
"beautiful:loading-state": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful155 /></div>,
"beautiful:thinking-state": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful156 /></div>,
"beautiful:streaming-text": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful157 /></div>,
"beautiful:approval-card": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful158 /></div>,
"beautiful:tool-chips": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful159 /></div>,
"beautiful:task-rows": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful160 /></div>,
"beautiful:chat-composer": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful161 /></div>,
"beautiful:prompt-bar": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful162 /></div>,
"beautiful:recommendation-card": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful163 /></div>,
"beautiful:context-cards": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful164 /></div>,
"beautiful:diff-table": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful165 /></div>,
"beautiful:records-table": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful166 /></div>,
"beautiful:filter-table": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful167 /></div>,
"beautiful:sidebar-nav": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful168 /></div>,
"beautiful:search": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful169 /></div>,
"beautiful:flowchart": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful170 /></div>,
"beautiful:insight-cards": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful171 /></div>,
"beautiful:code-block": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful172 /></div>,
"beautiful:fine-tune-card": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful173 /></div>,
"beautiful:selection-actions": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful174 /></div>,
"beautiful:agent-screen": () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><Beautiful175 /></div>,
"libraries:border-beam": ({dark}) => <BorderBeam theme={dark?"dark":"light"}><button style={{padding:"22px 38px",borderRadius:18,background:dark?"#202024":"#fff",color:dark?"#fff":"#18181b"}}>Follow the light</button></BorderBeam>,
"libraries:orbs": ({dark}) => <ThinkingOrb state="searching" size={64} color={dark?"#f4f4f5":"#27272a"} />,
"libraries:gooey": GooeyDemo,
"libraries:metal": ({dark}) => <MetalFx variant="button" theme={dark?"dark":"light"}><button style={{padding:"20px 36px"}}>Liquid metal</button></MetalFx>,
"libraries:image": LibraryImage
};
export default expressivePreviews;
