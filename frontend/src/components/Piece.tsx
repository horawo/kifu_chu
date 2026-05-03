import React from 'react';
import type { Piece as PieceModel } from '../types';
import { PIECE_DATA } from '../utils/pieceData';

interface PieceProps {
    piece: PieceModel;
    onClick?: () => void;
    isSelected?: boolean;
}

const GET_IMAGE_ID = (type: string, isPromoted: boolean): string => {
    if (!isPromoted) {
        const baseMap: Record<string, string> = {
            'Ousho': 'OU', 'Shishi': 'SHI', 'Hon_o': 'HON', 'Fuhyo': 'FU',
            'Chunin': 'CHU', 'Suizo': 'SUI', 'Ginsho': 'GI', 'Shugyo': 'SYU',
            'Dosho': 'DOU', 'Ogyo': 'OG', 'Kyosha': 'KY', 'Hensha': 'HEN',
            'Moko': 'MOKO', 'Mohyo': 'MOH', 'Kakugyo': 'KAKU', 'Hisha': 'HI',
            'Ryuou': 'RYU', 'Ryume': 'UMA', 'Kirin': 'KIRIN', 'Ho_o': 'HOU',
            'Kinsho': 'KIN'
        };
        return baseMap[type] || type;
    } else {
        // Promoted pieces (Red versions or New names) - Corrected based on user feedback
        const promotedMap: Record<string, string> = {
            'Fuhyo': 'TO',      // 歩兵 -> と金
            'Chunin': 'P_SUI',  // 仲人 -> 酔象(赤)
            'Suizo': 'TAI',     // 酔象 -> 太子
            'Kyosha': 'HAKU',   // 香車 -> 白駒
            'Hensha': 'GEI',    // 反車 -> 鯨鯢
            'Moko': 'HIRO',     // 盲虎 -> 飛鹿
            'Mohyo': 'P_KAKU',  // 猛豹 -> 角行(赤) [Correction]
            'Ginsho': 'P_SYU',  // 銀将 -> 竪行(赤) [Correction]
            'Dosho': 'P_OG',    // 銅将 -> 横行(赤) [Correction]
            'Shugyo': 'GYU',    // 竪行 -> 飛牛(赤) [Correction]
            'Ogyo': 'CHO',      // 横行 -> 奔猪(赤) [Correction]
            'Ryuou': 'HIJU',    // 竜王 -> 飛鷲
            'Ryume': 'TAKA',    // 竜馬 -> 角鷹
            'Hisha': 'P_RYU',   // 飛車 -> 竜王(赤)
            'Kakugyo': 'P_UMA', // 角行 -> 竜馬(赤)
            'Kirin': 'P_SHI',   // 麒麟 -> 獅子(赤)
            'Ho_o': 'P_HON',    // 鳳凰 -> 奔王(赤)
            'Kinsho': 'P_HI',   // 金将 -> 飛車(赤)
            // 'Shishi': (No promotion)
            // 'Hon_o': (No promotion)
        };
        return promotedMap[type] || `P_${type}`;
    }
};

const Piece: React.FC<PieceProps> = ({ piece, onClick, isSelected }) => {
    const baseData = PIECE_DATA[piece.type];

    // Dynamic asset loading with Vite
    const getImageUrl = (type: string, isPromoted: boolean) => {
        const id = GET_IMAGE_ID(type, isPromoted);
        return new URL(`../assets/koma/default/${id}.svg`, import.meta.url).href;
    };

    const isSente = piece.owner === 'sente' || (piece as any).player === 'sente';

    const style: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s, background-color 0.2s',
        // Highlights and rotation
        backgroundColor: isSelected ? 'rgba(255, 235, 59, 0.6)' : 'transparent',
        transform: isSente ? 'none' : 'rotate(180deg)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none'
    };

    return (
        <div style={style} onClick={onClick}>
            <img 
                src={getImageUrl(piece.type, piece.isPromoted)} 
                alt={piece.type}
                style={{
                    width: '90%',
                    height: '90%',
                    objectFit: 'contain',
                    // Optional: subtle shadow to make it pop
                    filter: isSelected ? 'drop-shadow(0 0 4px gold)' : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
                }}
                onError={(e) => {
                    // Fallback to text if SVG is missing
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerText = baseData?.kanji || '?';
                }}
            />
        </div>
    );
};

export default Piece;
