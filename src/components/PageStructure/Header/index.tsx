import React from 'react';
import { Layout } from 'antd';
import Logo from '../../../assets/img/logo.svg';

const { Header } = Layout;

const PageHeader = () => {
    return (
        <>
            <Layout className='headerLayout'>
                <Header>
                    <div>
                        <img src={Logo} />
                    </div>
                </Header>
            </Layout>
        </>
    );
};

export default PageHeader;