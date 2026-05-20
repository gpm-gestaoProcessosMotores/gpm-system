import Button from './Button.jsx';

export default function LoadingButton({ loading, children, loadingText = 'Carregando...', disabled, ...props }) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading ? loadingText : children}
    </Button>
  );
}
