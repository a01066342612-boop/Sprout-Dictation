import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PopoutWindowProps {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}

export const PopoutWindow: React.FC<PopoutWindowProps> = ({ children, title, onClose }) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const newWindow = useRef<Window | null>(null);

  useEffect(() => {
    // Create a new window
    const win = window.open('', '', 'width=1024,height=768,left=200,top=200');
    if (!win) {
      alert("팝업 차단이 설정되어 있습니다. 팝업을 허용해주세요.");
      onClose();
      return;
    }

    newWindow.current = win;
    win.document.title = title;

    // Copy all styles from the main window (Tailwind CDN, Fonts, etc.)
    // We copy the entire head content to ensure everything matches exactly.
    Array.from(document.head.children).forEach(child => {
        // Clone the node to avoid moving it from the main document
        win.document.head.appendChild(child.cloneNode(true));
    });

    // Create a container div for the React Portal
    const div = win.document.createElement('div');
    div.id = 'popout-root';
    div.style.height = '100%';
    div.style.width = '100%';
    
    // Ensure body takes full height for layout
    win.document.body.style.margin = '0';
    win.document.body.style.height = '100vh';
    win.document.body.style.width = '100vw';
    win.document.body.style.overflow = 'hidden';
    
    // Add the class for background color if needed, or rely on StudentView
    win.document.body.classList.add('bg-yellow-50');

    win.document.body.appendChild(div);
    setContainer(div);

    // Handle window close by user
    win.onbeforeunload = () => {
      onClose();
    };

    // Clean up when component unmounts
    return () => {
      if (newWindow.current) {
        newWindow.current.close();
        newWindow.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!container) return null;

  return createPortal(children, container);
};
