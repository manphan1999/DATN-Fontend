// import * as React from 'react';
// import { GlobalStyles, useTheme } from '@mui/material';

// export default function AppBackground() {
//     const theme = useTheme();
//     const isLight = theme.palette.mode === 'light';

//     const baseGradient = isLight
//         ? 'linear-gradient(180deg, #c3d0e2ff 0%, #f8fbeeff 100%)'
//         : 'linear-gradient(180deg, #0b1220 0%, #0e172a 100%)';

//     const dotA = isLight ? 'rgba(2, 6, 23, 0.04)' : 'rgba(255,255,255,0.04)';
//     const dotB = isLight ? 'rgba(2, 6, 23, 0.03)' : 'rgba(255,255,255,0.03)';

//     const bgImage = `
//     radial-gradient(${dotA} 1px, transparent 1px),
//     radial-gradient(${dotB} 1px, transparent 1px),
//     ${baseGradient}
//   `;

//     return (
//         <GlobalStyles styles={{
//             'body, #root': {
//                 minHeight: '100vh',
//                 backgroundImage: bgImage,
//                 backgroundSize: '20px 20px, 40px 40px, 100% 100%',
//                 backgroundPosition: '0 0, 10px 10px, 0 0'
//             }
//         }} />
//     );
// }


import * as React from "react";
import { GlobalStyles, useTheme } from "@mui/material";

export default function AppBackground() {
    const theme = useTheme();
    const isLight = theme.palette.mode === "light";

    const baseGradient = isLight
        ? "linear-gradient(180deg, #c3d0e2ff 0%, #f8fbeeff 100%)"
        : "linear-gradient(180deg, #0b1220 0%, #0e172a 100%)";

    const dotA = isLight ? "rgba(2, 6, 23, 0.04)" : "rgba(255,255,255,0.04)";
    const dotB = isLight ? "rgba(2, 6, 23, 0.03)" : "rgba(255,255,255,0.03)";

    const bgImage = `
    radial-gradient(${dotA} 1px, transparent 1px),
    radial-gradient(${dotB} 1px, transparent 1px),
    ${baseGradient}
  `;

    return (
        <GlobalStyles
            styles={{
                "body, #root": {
                    minHeight: "100vh", // bám theo viewport, không cố định > 600px
                    backgroundImage: bgImage,
                    backgroundSize: "20px 20px, 40px 40px, 100% 100%",
                    backgroundPosition: "0 0, 10px 10px, 0 0",
                },
            }}
        />
    );
}

