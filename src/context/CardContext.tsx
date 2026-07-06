import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface SavedCard {
    id: string;
    label: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    cardholderName: string;
    isDefault: boolean;
}

interface CardContextValue {
    cards: SavedCard[];
    defaultCard: SavedCard | null;
    addCard: (card: Omit<SavedCard, 'id'>) => SavedCard;
    deleteCard: (id: string) => void;
    setDefault: (id: string) => void;
}

const CardContext = createContext<CardContextValue | null>(null);
const STORAGE_KEY = 'aerher_cards';

export function CardProvider({ children }: { children: ReactNode }) {
    const [cards, setCards] = useState<SavedCard[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }, [cards]);

    const addCard = (card: Omit<SavedCard, 'id'>): SavedCard => {
        const newCard: SavedCard = {
            ...card,
            id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        };
        setCards((prev) => {
            const updated = newCard.isDefault ? prev.map((c) => ({ ...c, isDefault: false })) : prev;
            return [...updated, newCard];
        });
        return newCard;
    };

    const deleteCard = (id: string) => {
        setCards((prev) => prev.filter((c) => c.id !== id));
    };

    const setDefault = (id: string) => {
        setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
    };

    const defaultCard = cards.find((c) => c.isDefault) ?? cards[0] ?? null;

    return (
        <CardContext.Provider value={{ cards, defaultCard, addCard, deleteCard, setDefault }}>
            {children}
        </CardContext.Provider>
    );
}

export function useCards() {
    const ctx = useContext(CardContext);
    if (!ctx) throw new Error('useCards must be used inside CardProvider');
    return ctx;
}