import React, { useState } from 'react';

interface SaveInitialDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
    currentName?: string;
    isEditing?: boolean;
}

const SaveInitialDialog: React.FC<SaveInitialDialogProps> = ({
    isOpen,
    onClose,
    onSave,
    currentName = '',
    isEditing = false
}) => {
    const [name, setName] = useState(currentName);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (name.trim()) {
            setIsSaving(true);
            try {
                await onSave(name.trim());
                onClose();
            } catch (error) {
                alert('保存に失敗しました: ' + (error as Error).message);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isSaving) {
            handleSave();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '24px',
                    minWidth: '400px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '20px' }}>
                    {isEditing ? '初期配置を更新' : '初期配置を保存'}
                </h2>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        配置名
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="例: 居飛車vs振り飛車"
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            backgroundColor: '#6c757d',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            opacity: isSaving ? 0.6 : 1
                        }}
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || isSaving}
                        style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            backgroundColor: '#667eea',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: (!name.trim() || isSaving) ? 'not-allowed' : 'pointer',
                            opacity: (!name.trim() || isSaving) ? 0.6 : 1
                        }}
                    >
                        {isSaving ? '保存中...' : (isEditing ? '更新' : '保存')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveInitialDialog;
