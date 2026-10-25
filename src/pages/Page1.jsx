import { LandingPageContent } from '../components/LandingPageContent.jsx';

/**
 * Page 1 component
 * Same UI and button as all pages in the 20-page history loop.
 */
export function Page1(props) {
  return <LandingPageContent pageNumber={1} {...props} />;
}
