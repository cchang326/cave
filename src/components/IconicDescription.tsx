import React from 'react';
import { TreePine, Wheat, Leaf, Drumstick, Coins, ArrowRight, ArrowUpToLine, Pickaxe, SquareArrowDown } from 'lucide-react';
import { StoneIcon } from './StoneIcon';

interface Props {
  description: string;
  className?: string;
}

export const IconicDescription: React.FC<Props> = ({ description, className = "" }) => {
  // Regex to match [token], {small text}, (medium text), or other special characters or plain text
  // We split by tokens, keeping the tokens in the result
  const tokens = description.split(/(\[.*?\]|\{.*?\}|\(.*?\)|\+|\/|\||:|\n)/g).filter(token => token !== undefined);

  const renderToken = (token: string, index: number) => {
    if (token === '\n') return <div key={index} className="w-full h-0" />;
    
    const trimmed = token.trim();
    if (!trimmed && token !== '\n') {
      // If it's just whitespace (but not a newline we already handled), render a small space
      if (token.length > 0) return <span key={index} className="mx-px" />;
      return null;
    }

    // Handle small text wrapped in {}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const content = trimmed.substring(1, trimmed.length - 1);
      // Smallest text for auxiliary info
      return <span key={index} className="text-[9px] text-stone-600 font-bold leading-none whitespace-nowrap">{content}</span>;
    }

    // Handle medium text wrapped in ()
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      const content = trimmed.substring(1, trimmed.length - 1);
      // Medium text for labels/titles within the tile
      return <span key={index} className="text-[10px] text-stone-800 font-bold leading-none whitespace-nowrap">{content}</span>;
    }

    switch (trimmed) {
      case '+':
        return <span key={index} className="text-green-700 font-bold text-[14px] leading-none select-none -mr-px translate-y-[0.5px]">+</span>;
      case '/':
        return <span key={index} className="mx-0.5 text-stone-600 font-bold">/</span>;
      case ':':
        return <span key={index} className="mx-0.5 text-stone-600 font-bold">:</span>;
      case '[wood]':
        return <TreePine key={index} className="w-3.5 h-3.5 text-amber-900 inline-block" />;
      case '[stone]':
        return <StoneIcon key={index} className="w-3.5 h-3.5 text-stone-600 inline-block" />;
      case '[emmer]':
        return <Wheat key={index} className="w-3.5 h-3.5 text-yellow-800 inline-block" />;
      case '[flax]':
      case '[leaf]':
        return <Leaf key={index} className="w-3.5 h-3.5 text-green-800 inline-block" />;
      case '[flax-light]':
      case '[leaf-light]':
        return <Leaf key={index} className="w-3.5 h-3.5 text-green-600 inline-block" />;
      case '[flax-lighter]':
      case '[leaf-lighter]':
        return <Leaf key={index} className="w-3.5 h-3.5 text-green-400 inline-block" />;
      case '[food]':
        return <Drumstick key={index} className="w-3.5 h-3.5 text-orange-800 inline-block" />;
      case '[gold]':
        return <Coins key={index} className="w-3.5 h-3.5 text-amber-600 inline-block" />;
      case '[blue-room]':
        return <div key={index} className="w-3.5 h-3.5 bg-blue-600 rounded-sm border border-blue-700 inline-block shadow-sm" />;
      case '[furnish]':
        return <SquareArrowDown key={index} className="w-[17.5px] h-[17.5px] text-stone-700 inline-block shadow-sm" />;
      case '|':
        return <span key={index} className="mx-1 text-stone-400 font-light">|</span>;
      case '[arrow-right]':
        return <ArrowRight key={index} className="w-3.5 h-3.5 text-stone-600 inline-block mx-px" />;
      case '[arrow-up-to-line]':
        return <ArrowUpToLine key={index} className="w-3.5 h-3.5 text-blue-800 inline-block mx-px" />;
      case '[pickaxe]':
        return <Pickaxe key={index} className="w-3.5 h-3.5 text-stone-600 inline-block" />;
      case '[space]':
        return <span key={index} className="w-2 inline-block" />;
      case '[1]':
        return (
          <span key={index} className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-orange-500 text-white text-[10px] font-bold shadow-sm border border-orange-600 mx-px whitespace-nowrap">
            1
          </span>
        );
      case '[2]':
        return (
          <span key={index} className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-orange-500 text-white text-[10px] font-bold shadow-sm border border-orange-600 mx-px whitespace-nowrap">
            2
          </span>
        );
      case '[3]':
        return (
          <span key={index} className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-orange-500 text-white text-[10px] font-bold shadow-sm border border-orange-600 mx-px whitespace-nowrap">
            3
          </span>
        );
      case '[4]':
        return (
          <span key={index} className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-orange-500 text-white text-[10px] font-bold shadow-sm border border-orange-600 mx-px whitespace-nowrap">
            4
          </span>
        );
      default:
        // Handle plain text or numbers - set a default size to avoid "too big" text
        return <span key={index} className="text-[14px] font-bold text-stone-800 whitespace-nowrap leading-none">{token}</span>;
    }
  };

  const elements = [];
  let lastWasTrigger = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const trimmed = token.trim();
    
    if (!trimmed && token !== '\n') {
      elements.push(renderToken(token, i));
      continue;
    }

    if (trimmed === '+' && lastWasTrigger) {
      continue; // Skip the plus sign after a trigger
    }

    elements.push(renderToken(token, i));

    if (trimmed === '[arrow-right]' || trimmed === ':' || trimmed === '{:}' || trimmed === '{[arrow-right]}') {
      lastWasTrigger = true;
    } else if (trimmed !== '') {
      lastWasTrigger = false;
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-y-0.5 leading-none ${className}`}>
      {elements}
    </div>
  );
};
