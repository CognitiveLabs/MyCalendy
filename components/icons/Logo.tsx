const Logo = ({ className = '', ...props }) => (
  <img
    src="/logo.png" // Update this line to point to the correct path of your "logo.png" image
    alt="Logo"
    className={className}
    style={{ maxWidth: '50px', maxHeight: '50px' }} // Adjust the values as needed for your thumbnail size
    {...props}
  />
);

export default Logo;
