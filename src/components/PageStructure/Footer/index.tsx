import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const PageFooter = () => {
    return (
        <Layout className='footerLayout'>
            <Footer>
                DOCKET © 2021
            </Footer>
        </Layout>
    );
};

export default PageFooter;