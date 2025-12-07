export type IconSet = 'huge' | 'pixelart' | 'phosphor' | 'lucide';
export interface IconProps {
    name: string;
    color?: string;
    stroke?: string;
    style?: 'sharp' | 'default' | 'fill' | 'thin' | 'light' | 'bold' | 'duotone';
    set?: IconSet;
    className?: string;
    size?: number | string;
}
export declare function Icon({ name, color, stroke, style, set, className, size }: IconProps): import("react/jsx-runtime").JSX.Element | null;
