// components/YamlView.tsx
interface Props {
  yaml: string;
}

function highlightYaml(yaml: string): string {
  return yaml
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^(\s*)([\w-]+)(:)/gm, '$1<span style="color:#5e9cf7">$2</span>$3')
    .replace(/:\s*"([^"]*)"/g, ': <span style="color:#7ecb6e">"$1"</span>')
    .replace(/:\s*(\d+)/gm, ': <span style="color:#ee9d5c">$1</span>')
    .replace(/^(\s*#.*)$/gm, '<span style="color:#636366">$1</span>');
}

export default function YamlView({ yaml }: Props) {
  return (
    <pre
      className="bg-[#1c1c1e] rounded-xl p-5 font-mono text-[12px] leading-[1.8] text-[#e5e5e7] whitespace-pre-wrap overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: highlightYaml(yaml) }}
    />
  );
}
