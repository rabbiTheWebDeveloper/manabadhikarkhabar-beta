export default function Logo() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center relative py-2">
            <a href="/" className="inline-block relative">

                {/* SVG Dove & Document Logo */}
                <div className="absolute -top-8 -left-8 md:-top-10 md:-left-12 lg:-top-14 lg:-left-20 z-0 w-32 h-24 md:w-36 md:h-28 lg:w-48 lg:h-36 pointer-events-none opacity-90 overflow-visible">
                    <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">

                        {/* Secondary Wing (Right) */}
                        <path d="M85,50 C 75,25 90,15 105,25" stroke="#D20000" strokeWidth="2.5" fill="none" strokeLinecap="round" className="dark:stroke-red-500" />

                        {/* Main Red Dove Path */}
                        <path d="M90,55 C70,30 40,25 20,30 C28,38 35,45 32,55 C22,54 15,50 10,50 C20,60 35,68 45,70 C30,80 15,90 5,100 C35,95 60,80 75,65 C90,80 110,75 120,55 L135,50 L125,42 C115,32 100,35 90,55 Z"
                            stroke="#D20000" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" className="dark:stroke-red-500" />

                        {/* Dove Eye */}
                        <circle cx="112" cy="46" r="1.5" fill="#D20000" className="dark:fill-red-500" />

                        {/* Green Document */}
                        <g transform="translate(122, 45) rotate(15)">
                            <rect x="0" y="0" width="24" height="32" stroke="#10B981" strokeWidth="2.5" fill="white" className="dark:fill-[#111] dark:stroke-emerald-500" />
                            <line x1="5" y1="8" x2="19" y2="8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" className="dark:stroke-emerald-500" />
                            <line x1="5" y1="16" x2="19" y2="16" stroke="#10B981" strokeWidth="2" strokeLinecap="round" className="dark:stroke-emerald-500" />
                            <line x1="5" y1="24" x2="14" y2="24" stroke="#10B981" strokeWidth="2" strokeLinecap="round" className="dark:stroke-emerald-500" />
                        </g>
                    </svg>
                </div>

                {/* Text Logo */}
                <div className="relative z-10 flex flex-col items-center">
                    <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-neutral-900 dark:text-white mt-4">
                        মানবাধিকার <span className="text-red-700 dark:text-red-500">খবর</span>
                    </h1>
                </div>
            </a>
        </div>
    );
}