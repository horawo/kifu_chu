import type { PieceType } from '../types';

// Directions
export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface PieceMovement {
    step?: Direction[];
    range?: Direction[];
    jump?: Direction[]; // Jump 2 squares in these directions. (Kirin/Phoenix)
    special?: 'lion' | 'eagle' | 'falcon' | 'prince';
}

export const PIECE_DATA: Record<PieceType, { kanji: string; promotedType?: PieceType; moves?: string; movement?: PieceMovement }> = {
    Ousho: {
        kanji: '王将',
        movement: { step: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] }
    },
    Kinsho: {
        kanji: '金将', promotedType: 'Kinbisha',
        // Gold: Front 3, Side 2, Back 1 (S). Total 6.
        movement: { step: ['N', 'NE', 'NW', 'E', 'W', 'S'] }
    },
    Ginsho: {
        kanji: '銀将', promotedType: 'Shugyo',
        // Silver: Front, 4 Diagonals.
        movement: { step: ['N', 'NE', 'SE', 'SW', 'NW'] }
    },
    Dosho: {
        kanji: '銅将', promotedType: 'Ogyo',
        // Copper: Front (N), Step Back (S), Step Back Diagonals are NOT standard?
        // Source: Forward(N), Forward Diagonals(NE, NW), Backward(S).
        // Wait, standard source says: Front, Front-Sides (NE,NW), Back (S).
        // Let's trust search result: "前方と斜め前、そして真後ろに1マス" -> N, NE, NW, S.
        movement: { step: ['N', 'NE', 'NW', 'S'] }
    },
    Mohyo: {
        kanji: '猛豹', promotedType: 'Kakugyo',
        // Ferocious Leopard: All except sides? N, NE, NW, S, SE, SW.
        movement: { step: ['N', 'NE', 'NW', 'S', 'SE', 'SW'] }
    },
    Moko: {
        kanji: '盲虎', promotedType: 'Hiroku',
        // Blind Tiger: All except Front.
        movement: { step: ['NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] }
    },
    Suizo: {
        kanji: '醉象', promotedType: 'Taishi',
        // Drunk Elephant: All except Back directly.
        movement: { step: ['N', 'NE', 'E', 'SE', 'SW', 'W', 'NW'] }
    },
    Chunin: {
        kanji: '仲人', promotedType: 'Suizo',
        movement: { step: ['N', 'S'] }
    },
    Fuhyo: {
        kanji: '歩兵', promotedType: 'Kinsho',
        movement: { step: ['N'] }
    },
    Kyosha: {
        kanji: '香車', promotedType: 'Hakuku',
        movement: { range: ['N'] }
    },
    Hensha: {
        kanji: '反車', promotedType: 'Keigei',
        movement: { range: ['N', 'S'] }
    },
    Hisha: {
        kanji: '飛車', promotedType: 'Ryuou',
        movement: { range: ['N', 'E', 'S', 'W'] }
    },
    Kakugyo: {
        kanji: '角行', promotedType: 'Ryume',
        movement: { range: ['NE', 'SE', 'SW', 'NW'] }
    },
    Ryume: {
        kanji: '龍馬', promotedType: 'Kakuou',
        // Bishop + 1 Step Orthogonal
        movement: { range: ['NE', 'SE', 'SW', 'NW'], step: ['N', 'E', 'S', 'W'] }
    },
    Ryuou: {
        kanji: '龍王', promotedType: 'Hiju',
        // Rook + 1 Step Diagonal
        movement: { range: ['N', 'E', 'S', 'W'], step: ['NE', 'SE', 'SW', 'NW'] }
    },
    Ogyo: {
        kanji: '横行', promotedType: 'Honcho',
        // Side Mover: Range Side, Step Front. (Wikipedia: Range E/W, Step N, S is not mentioned usually? Or Step N?)
        // Check: "Range Side(E,W) + Step Front(N)". Some sources say N and S?
        // Source [10] Honcho is Promoted Side Mover.
        // Ogyo itself: Range E/W, Step N. (Often simplified as Rooks horizontal + Pawn vertical).
        movement: { range: ['E', 'W'], step: ['N'] }
    },
    Shugyo: {
        kanji: '竪行', promotedType: 'Higyu',
        // Vertical Mover: Range Vert, Step Side.
        movement: { range: ['N', 'S'], step: ['E', 'W'] }
    },
    Kirin: {
        kanji: '麒麟', promotedType: 'Shishi',
        // Kirin: Step Diagonals (NE, SE, SW, NW). Jump 2 Orthogonal (Target only? Or 2 steps?).
        // Source: "Jump 2 Orthogonal".
        movement: { step: ['NE', 'SE', 'SW', 'NW'], jump: ['N', 'E', 'S', 'W'] }
    },
    Ho_o: {
        kanji: '鳳凰', promotedType: 'Hon_o',
        // Phoenix: Step Orthogonal (N,E,S,W). Jump 2 Diagonal.
        movement: { step: ['N', 'E', 'S', 'W'], jump: ['NE', 'SE', 'SW', 'NW'] }
    },
    Shishi: {
        kanji: '獅子',
        movement: { special: 'lion' }
    },
    Hon_o: {
        kanji: '奔王',
        movement: { range: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] }
    },

    // Promoted
    Taishi: {
        kanji: '太子',
        movement: { step: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] }
    },
    Hakuku: {
        kanji: '白駒',
        // White Horse: Range Forward (N) + Diagonals Forward (NE, NW)
        movement: { range: ['N', 'NE', 'NW'] }
    },
    Keigei: {
        kanji: '鯨鯢',
        // Whale: Range Back Diagonals (SE, SW) + Vertical (N, S)
        // Source: "Vertical(N,S) and Back Diagonals(SE,SW)" range.
        movement: { range: ['N', 'S', 'SE', 'SW'] }
    },
    Kakuou: {
        kanji: '角鷹',
        movement: { special: 'eagle' } // Range Diag + Lion Front? No.
        // Horned Falcon: Range Diagonals (all) + "Lion Move" in Orthogonal Forward (N). (Move 2 steps or jump or igui in N direction??)
        // Wait. Horned Falcon:
        // Range: NE, SE, SW, NW.
        // Special: "Lion move" in Front (N)?
        // Actually: Range Diagonals.
        // And "Front" is a "Lion Move" (can step 2 squares, jump, or igui in that line).
        // Also moves to sides/back?
        // Source: Range Diagonals. "Except front, it moves like a lion"? No.
        // Let's treat as special 'eagle'.
    },
    Hiju: {
        kanji: '飛鷲',
        movement: { special: 'falcon' } // Soaring Eagle: Range Orthogonal + Lion Diagonals Forward?
        // Range: N, E, S, W.
        // Special: Lion move in Front Diagonals (NE, NW).
    },
    Honcho: {
        kanji: '奔猪',
        // Free Boar: Side Mover Promoted.
        // Range: E, W + Diagonals (all)?
        // Source [10]: "Side range and Diagonal range".
        movement: { range: ['E', 'W', 'NE', 'SE', 'SW', 'NW'] }
    },
    Higyu: {
        kanji: '飛牛',
        // Flying Ox: Vertical Mover Promoted.
        // Range: N, S + Diagonals (all).
        movement: { range: ['N', 'S', 'NE', 'SE', 'SW', 'NW'] }
    },
    Hiroku: {
        kanji: '飛鹿',
        // Flying Stag: Blind Tiger Promoted.
        // Range: N, S. Step: All 1 step (except N/S? No, Range covers it).
        // Source [4]: "Rows N/S range. Side/Diag 1 step."
        movement: { range: ['N', 'S'], step: ['NE', 'E', 'SE', 'SW', 'W', 'NW'] }
    },
    Kinbisha: {
        kanji: '飛車', // Gold Promoted.
        // Kinbisha (Gold Rook): Moves like a Rook.
        // Source [1]: "Moves like a Rook".
        // Just Rook.
        movement: { range: ['N', 'E', 'S', 'W'] }
    }
};
