import React, { useEffect, useRef } from 'react';
import type { Move } from '../types';
import { formatMove } from '../utils/moveNotation';

interface MoveListProps {
    moves: Move[];
    currentMoveIndex: number;
    onMoveClick: (index: number) => void;
}

const MoveList: React.FC<MoveListProps> = ({ moves, currentMoveIndex, onMoveClick }) => {
    const listContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (listContainerRef.current) {
            const container = listContainerRef.current;
            
            // 「最初」に戻った場合は、スクロールを一番上へ強制リセット
            if (currentMoveIndex === -1) {
                container.scrollTop = 0;
            } else {
                const ulElement = container.querySelector('ul');
                if (ulElement) {
                    // 先頭に「開始局面」が追加されたため、指し手要素のインデックスは currentMoveIndex + 1 となる
                    const activeItem = ulElement.children[currentMoveIndex + 1] as HTMLElement;
                    if (activeItem) {
                        const containerRect = container.getBoundingClientRect();
                        const itemRect = activeItem.getBoundingClientRect();

                        if (itemRect.bottom > containerRect.bottom) {
                            // 隠れている要素が下側にある場合、最下部が見えるようにスクロール
                            container.scrollTop += (itemRect.bottom - containerRect.bottom);
                        } else if (itemRect.top < containerRect.top) {
                            // 隠れている要素が上側にある場合、上部が見えるようにスクロール
                            container.scrollTop -= (containerRect.top - itemRect.top);
                        }
                    }
                }
            }
        }
    }, [currentMoveIndex]);

    return (
        <div style={{
            height: '100%', // 親要素に合わせて伸縮
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden' // 外枠の高さは変えない
        }}>
            <h3 style={{ margin: 0, padding: '15px', fontSize: '16px', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa', color: '#333' }}>
                指し手一覧
            </h3>
            <div 
                ref={listContainerRef}
                style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '10px' 
                }}
            >
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {/* 0手目相当（初期配置）の項目 */}
                    <li
                        onClick={() => onMoveClick(-1)}
                        style={{
                            cursor: 'pointer',
                            padding: '4px 8px',
                            marginBottom: '6px',
                            backgroundColor: currentMoveIndex === -1 ? '#e2e3ff' : 'transparent',
                            color: currentMoveIndex === -1 ? '#000' : '#444',
                            fontWeight: currentMoveIndex === -1 ? '600' : 'normal',
                            borderRadius: '4px',
                            transition: 'all 0.2s',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            borderBottom: '1px dashed #ccc'
                        }}
                        onMouseEnter={(e) => {
                            if (currentMoveIndex !== -1) {
                                e.currentTarget.style.backgroundColor = '#f4f4f4';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (currentMoveIndex !== -1) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        開始局面
                    </li>

                    {/* 実際の指し手 */}
                    {moves.map((move, index) => (
                        <li
                            key={index}
                            onClick={() => onMoveClick(index)}
                            style={{
                                cursor: 'pointer',
                                padding: '4px 8px',
                                marginBottom: '2px',
                                backgroundColor: index === currentMoveIndex ? '#e2e3ff' : 'transparent',
                                color: index === currentMoveIndex ? '#000' : '#444',
                                fontWeight: index === currentMoveIndex ? '600' : 'normal',
                                borderRadius: '4px',
                                transition: 'all 0.2s',
                                fontSize: '13px',
                                fontFamily: 'monospace'
                            }}
                            onMouseEnter={(e) => {
                                if (index !== currentMoveIndex) {
                                    e.currentTarget.style.backgroundColor = '#f4f4f4';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (index !== currentMoveIndex) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            {formatMove(move, index + 1)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MoveList;
