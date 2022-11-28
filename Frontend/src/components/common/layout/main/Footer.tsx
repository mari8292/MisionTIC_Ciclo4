import React from 'react';
import { Row } from 'reactstrap';

import { Colxx } from '../../../common/CustomBootstrap';

const Footer = () => {
  return (
    <footer className="page-footer">
      <div className="footer-content">
        <div className="container-fluid">
          <Row>
            <Colxx xxs="12" sm="2" lg="2"></Colxx>

          </Row>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
