
const fs = require('fs');

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

const colors = {
    light: {
        background: "0 0% 100%",
        foreground: "20 6% 10%",
        card: "0 0% 100%",
        cardForeground: "20 6% 10%",
        activity: "0 0% 96%",
        popover: "0 0% 100%",
        popoverForeground: "20 6% 10%",
        primary: "16 59% 41%",
        primaryForeground: "40 18% 95%",
        secondary: "24 6% 15%",
        secondaryForeground: "40 18% 87%",
        muted: "24 6% 90%",
        mutedForeground: "24 6% 40%",
        accent: "40 43% 73%",
        accentForeground: "20 6% 10%",
        destructive: "0 84.2% 60.2%",
        destructiveForeground: "0 0% 98%",
        border: "24 6% 85%",
        input: "24 6% 85%",
        ring: "16 59% 41%"
    },
    dark: {
        background: "24 6% 10%",
        foreground: "40 18% 87%",
        card: "24 6% 16%",
        cardForeground: "40 18% 87%",
        activity: "24 6% 13%",
        popover: "24 6% 16%",
        popoverForeground: "40 18% 87%",
        primary: "16 59% 41%",
        primaryForeground: "40 18% 95%",
        secondary: "24 6% 20%",
        secondaryForeground: "40 18% 87%",
        muted: "24 6% 20%",
        mutedForeground: "40 10% 60%",
        accent: "40 43% 73%",
        accentForeground: "20 6% 10%",
        destructive: "0 62.8% 30.6%",
        destructiveForeground: "40 18% 87%",
        border: "24 6% 22%",
        input: "24 6% 22%",
        ring: "40 43% 73%"
    }
};

let output = "";
for (const mode in colors) {
    output += `### ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode\n`;
    for (const [name, value] of Object.entries(colors[mode])) {
        const [h, s, l] = value.split(' ').map(v => parseFloat(v));
        const hex = hslToHex(h, s, l);
        const formattedName = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        output += `- **${formattedName}**: ${hex}\n`;
    }
    output += "\n";
}

fs.writeFileSync('colors_output.txt', output);
