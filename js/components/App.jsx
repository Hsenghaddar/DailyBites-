import React from 'react';
import { Nav } from './Nav';
import { Footer } from './Footer';

export const App = ({ children }) => {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
};
