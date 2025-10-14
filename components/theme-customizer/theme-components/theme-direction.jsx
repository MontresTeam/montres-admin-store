// import { AlignEndVertical, AlignStartVertical } from "lucide-react";

// const ThemeDirection = () => {
//     return (
//         <div className="theme-setting-item">
//             <h6 className="font-medium text-base mb-3">Color Scheme</h6>
//             <div className="grid grid-cols-2 gap-4">
//                 <div
//                     className={`cursor-pointer border border-neutral-300 flex items-center justify-center flex items-center text-neutral-500 dark:text-neutral-200 gap-4 hover:bg-primary/10 duration-300 h-[60px] rounded-md ring-2 ring-transparent dark:border-slate-500`}
//                 >
//                     <AlignStartVertical />
//                     <h6
//                         className={`text-center text-sm font-medium text-neutral-500 dark:text-neutral-200`}
//                     >LTL</h6>
//                 </div>

//                 <div
//                     className={`cursor-pointer border border-neutral-300 flex items-center justify-center flex items-center text-neutral-500 dark:text-neutral-200 gap-4 hover:bg-primary/10 duration-300 h-[60px] rounded-md ring-2 ring-transparent dark:border-slate-500`}
//                 >
//                     <h6
//                         className={`text-center text-sm font-medium text-neutral-500 dark:text-neutral-200`}
//                     >RTL</h6>
//                     <AlignEndVertical />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ThemeDirection;




"use client";

import { AlignEndVertical, AlignStartVertical } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeDirection = () => {
    const [direction, setDirection] = useState("ltr");

    useEffect(() => {
        const savedDir = localStorage.getItem("direction");

        if (savedDir) {
            setDirection(savedDir);
            document.documentElement.setAttribute("dir", savedDir);
        }
    })

    const handleDirectionChange = (dir) => {
        setDirection(dir);
        document.documentElement.dir = dir;
        localStorage.setItem("direction", dir);
    };

    return (
        <div className="theme-setting-item">
            <h6 className="font-medium text-base mb-3">Page Direction</h6>
            <div className="grid grid-cols-2 gap-4">
                {/* LTR */}
                <div
                    onClick={() => handleDirectionChange("ltr")}
                    className={`cursor-pointer border flex items-center justify-center gap-2 h-[60px] rounded-md ring-2 duration-300 ${direction === "ltr"
                        ? "ring-primary border-primary bg-primary/10"
                        : "ring-transparent border-neutral-300 dark:border-slate-500"
                        } hover:bg-primary/10`}
                >
                    <AlignStartVertical className={`${direction === "ltr" ? "text-primary" : ""}`} />
                    <h6 className={`text-sm font-medium text-neutral-500 dark:text-neutral-200 ${direction === "ltr" ? "text-primary" : ""}`}>
                        LTR
                    </h6>
                </div>

                {/* RTL */}
                <div
                    onClick={() => handleDirectionChange("rtl")}
                    className={`cursor-pointer border flex items-center justify-center gap-2 h-[60px] rounded-md ring-2 duration-300 ${direction === "rtl"
                        ? "ring-primary border-primary bg-primary/10"
                        : "ring-transparent border-neutral-300 dark:border-slate-500"
                        } hover:bg-primary/10`}
                >
                    <h6 className={`text-sm font-medium text-neutral-500 dark:text-neutral-200 ${direction === "rtl" ? "text-primary" : ""}`}>
                        RTL
                    </h6>
                    <AlignEndVertical className={`${direction === "rtl" ? "text-primary" : ""}`} />
                </div>
            </div>
        </div>
    );
};

export default ThemeDirection;
