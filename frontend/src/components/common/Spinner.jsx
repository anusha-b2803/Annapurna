export default function Spinner({ size = 'md', center = false }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  const spinner = (
    <div className={`animate-spin rounded-full border-b-2 border-primary-500 ${sizes[size]}`} />
  );
  if (center) return <div className="flex items-center justify-center p-8">{spinner}</div>;
  return spinner;
}
