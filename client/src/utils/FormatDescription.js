import React from 'react'

export default function formatDescription(description) {
    if(!description) return '';
    
    //split the description by double line breaks to create paragraphs
    const paragraphs = description.split('\n\n');
    
    return React.createElement(
        'div', 
        {className: "formatted-description"},
        paragraphs.map((paragraph, index) => {
            //check if this paragraph contains multiple lines
            if (paragraph.includes('\n')) {
            //split the multi-line paragraph into separate lines
            const lines = paragraph.split('\n');
                return React.createElement(
                    'div',
                    {key: `paragraph-${index}`},
                    lines.map((line, lineIndex) => 
                        React.createElement(
                            'p',
                            { key: `line-${index}-${lineIndex}` },
                            line
                        )
                    )
                );
            }
            //regular paragraph
            return React.createElement(
                'p',
                {key: `paragraph-${index}`},
                paragraph
            );
        })
    );
}