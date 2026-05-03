export type Player = 'sente' | 'gote';

export type PieceType =
    | 'Ousho' | 'Kinsho' | 'Ginsho' | 'Dosho' | 'Mohyo' | 'Moko' | 'Suizo' | 'Chunin'
    | 'Fuhyo' | 'Kyosha' | 'Hensha' | 'Hisha' | 'Kakugyo' | 'Ryume' | 'Ryuou'
    | 'Ogyo' | 'Shugyo' | 'Kirin' | 'Ho_o' | 'Shishi' | 'Hon_o'
    // Promoted only
    | 'Taishi' | 'Hakuku' | 'Keigei' | 'Kakuou' | 'Hiju' | 'Honcho' | 'Higyu' | 'Hiroku' | 'Kinbisha';

export interface Piece {
    type: PieceType;
    owner: Player;  // Changed from 'player' to 'owner'
    isPromoted: boolean;
}

export type Board = (Piece | null)[][]; // 12x12 grid
export type BoardState = (Piece | null)[][]; // Alias for backward compatibility

export interface Position {
    x: number; // 0-11
    y: number; // 0-11
}

export interface Move {
    from: Position;
    to: Position;
    piece: Piece;          // The piece that moved (before the move)
    promoted: boolean;     // Whether this move promoted the piece
    captured?: Piece;      // The piece that was captured (if any)
    lionMidStep?: Position; // For 2-step moves (Lion, Eagle, Falcon): the intermediate position
}

export interface Kifu {
    id?: number;
    title: string;
    kifu_text: string;
    is_public: boolean;
    sente_name?: string;
    gote_name?: string;
}
