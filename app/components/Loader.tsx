import { Icon } from '@modules/icons';

export default function Loader() {
  return (
    <Icon 
      set="phosphor" 
      name="spinner" 
      color="white"
      className="w-6 animate-spin"
    />
  );
}