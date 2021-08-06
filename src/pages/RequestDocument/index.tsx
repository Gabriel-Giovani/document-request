import 'antd/dist/antd.css';
import '../../assets/styles/style.scss';

import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Tag, Form, Input, Button, Select, message, Divider, Modal, Spin, Pagination } from 'antd';
import { CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/PageStructure/Header';
import PageFooter from '../../components/PageStructure/Footer';
import EmptyDocumentIcon from '../../assets/img/empty-document.svg';
import MaskedInput from '../../components/MaskedInput';
import { del, get, post, getAddress } from '../../services/api';
import { EPeopleType, EStatusSolicitation } from '../../helpers/enums';
import moment from 'moment';

const DATE_FORMAT = 'DD/MM/YYYY';
const PAGE_SIZE = 10;

const RequestDocument = () => {
    const [form] = Form.useForm();

    const [formData, setFormData] = useState<any>({
        documentName: '',
        peopleType: EPeopleType.PHYSICAL_PEOPLE,
        cpf: '',
        cnpj: '',
        name: '',
        corporateName: '',
        cep: '',
        street: '',
        streetNumber: '',
        city: '',
        uf: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingData, setIsSendingData] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [documentId, setDocumentId] = useState(0);
    const [visibleModal, setVisibleModal] = useState(false);
    const [lastApplicant, setLastApplicant] = useState(null as any);
    const [lastDateApplicant, setLastDateApplicant] = useState(null as any);
    const [statusSolicitation, setStatusSolicitation] = useState(EStatusSolicitation.PENDING);
    const [pagination, setPagination] = useState({
        current: 1,
        minIndex: 0,
        maxIndex: 0
    });

    useEffect(() => {
        pagination['maxIndex'] = 10;
        setPagination({ ...pagination });
        getDocuments();
    }, []);

    const getDocuments = async () => {
        if(!isLoading){
            setIsLoading(true);

            const content = await get('documents');

            if(content){
                setDocuments(content);
            }

            setIsLoading(false);
        }
    };

    const updateFormData = (key: string, e: any) => {
        setStatusSolicitation(EStatusSolicitation.PENDING);
        formData[key] = e.target.value;
        setFormData({ ...formData });
    };

    const updateSelect = (key: string, value: any) => {
        updateFormData(key, { target: { value } });
    };

    const getNumberOfString = (value: String) => {
        return value.split("").filter((n: any) => (Number(n) || n == 0)).join("");
    };

    const validateFormData = () => {
        const { documentName, peopleType, cpf, cnpj, name, corporateName, cep, street, streetNumber, city, uf } = formData;

        if(!documentName || documentName.length < 2){
            message.error('Insira um nome de documento válido!');
            return false;
        }

        if(!peopleType || peopleType <= 0){
            message.error('Selecione um tipo de pessoa válido!');
            return false;
        }

        if(peopleType === EPeopleType.PHYSICAL_PEOPLE){
            const cpfNumber = getNumberOfString(cpf);
            
            if(!cpfNumber || !Number(cpfNumber) || cpfNumber.length < 11){
                message.error('Insira um CPF válido!');
                return false;
            }

            if(!name) {
                message.error('Insira seu nome completo!');
                return false;
            }
        }

        if(peopleType === EPeopleType.LEGAL_PEOPLE){
            const cnpjNumber = getNumberOfString(cnpj);

            if(!cnpjNumber || !Number(cnpjNumber) || cnpjNumber.length < 14) {
                message.error('Insira um CNPJ válido!');
                return false;
            }

            if(!corporateName) {
                message.error('Insira a razão social!');
                return false;
            }
        }

        const cepNumber = getNumberOfString(cep);
        if(!cepNumber || !Number(cepNumber) || cepNumber.length < 8){
            message.error('Insira um CEP válido!');
            return false;
        }

        if(!street){
            message.error('Insira a rua de seu endereço!');
            return false;
        }

        if(!streetNumber || streetNumber.length < 0){
            message.error('Insira um número de endereço válido!');
            return false;
        }

        if(!city) {
            message.error('Insira a cidade de seu endereço!');
            return false;
        }

        if(!uf || uf.length < 2){
            message.error('Insira um UF de endereço válido!');
            return false;
        }

        return true;
    };

    const clearForm = () => {
        form.resetFields();
        setFormData({
            documentName: '',
            peopleType: EPeopleType.PHYSICAL_PEOPLE,
            cpf: '',
            cnpj: '',
            name: '',
            corporateName: '',
            cep: '',
            street: '',
            streetNumber: '',
            city: '',
            uf: ''
        });

    };

    const sendData = async () => {
        if(!isSendingData){
            setIsSendingData(true);

            if(validateFormData()){
                const obj = formData;
                obj.createdAt = moment().format(DATE_FORMAT);

                const req = await post('documents', obj);
    
                if(req){
                    message.success('Documento criado com sucesso');
                    clearForm();
                    await getDocuments();
                    setLastApplicant(obj.name.length > 0 ? obj.name : obj.corporateName);
                    setLastDateApplicant(moment().format(DATE_FORMAT));
                    setStatusSolicitation(EStatusSolicitation.FINISHED);
                }
            }

            setIsSendingData(false);
        }
    }

    const handleDelete = (documentId: number) => {
        setDocumentId(documentId);
        setVisibleModal(true);
    };

    const deleteDocument = async (documentId: number) => {
        if(!isSendingData){
            setIsSendingData(true);

            const req = await del(`documents/${documentId}`);

            if(req){
                message.success('Documento excluído com sucesso');
                setVisibleModal(false);
                await getDocuments();
            }

            setIsSendingData(false);
        }
    };

    const handlePaginationChange = (page: any) => {
        setPagination({
            current: page,
            minIndex: (page - 1) * PAGE_SIZE,
            maxIndex: page * PAGE_SIZE
        });
    }

    const setAddressData = async () => {
        if(!isLoading){
            setIsLoading(true);

            const addressData = await getAddress(formData.cep);

            if(addressData.erro)
                message.error('Não foi possível encontrar o endereço com o CEP informado.');

            formData['street'] = addressData.logradouro;
            formData['city'] = addressData.localidade;
            formData['uf'] = addressData.uf;
            setFormData({ ...formData });

            form.setFieldsValue({
                street: addressData.logradouro,
                city: addressData.localidade,
                uf: addressData.uf
            });

            setIsLoading(false);
        }
    };

    const renderDocuments = () => {
        return (
            documents.map((document: any, index: number) => (
                index >= pagination.minIndex && index < pagination.maxIndex &&
                    <Card
                        key={document.id}
                        className='card-layout card-info-document'
                        title={document.documentName}
                        extra={
                            <DeleteOutlined
                                style={{ fontSize: 20, color: '#3570B2' }}
                                onClick={() => handleDelete(document.id)}
                            />
                        }
                    >
                        <Row gutter={24}>
                            <Col xl={12} lg={12} md={12} sm={12} xs={24}>
                                <p>
                                    <strong>
                                        {
                                            document.peopleType === EPeopleType.PHYSICAL_PEOPLE ? 'Pessoa Física'
                                            : 'Pessoa Jurídica'
                                        }
                                    </strong>
                                </p>
                                {
                                    document.peopleType === EPeopleType.PHYSICAL_PEOPLE ?
                                        <>
                                            <p>Nome: {document.name}</p>
                                            <p>CPF: {document.cpf}</p>
                                        </>
                                    :
                                        <>
                                            <p>Razão social: {document.corporateName}</p>
                                            <p>CNPJ: {document.cnpj}</p>
                                        </>
                                }
                            </Col>
                            <Col className="registry-data-col" xl={12} lg={12} md={12} sm={12} xs={24}>
                                <p><strong>Dados do cartório</strong></p>
                                <p>CEP: {document.cep}</p>
                                <Row gutter={24}>
                                    <Col xl={12} lg={16} md={16} sm={16} xs={24}><p>Rua: {document.street}</p></Col>
                                    <Col xl={12} lg={8} md={8} sm={8} xs={24}><p>N°: {document.streetNumber}</p></Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col xl={12} lg={16} md={16} sm={16} xs={24}><p>Cidade: {document.city}</p></Col>
                                    <Col xl={12} lg={8} md={8} sm={8} xs={24}><p>UF: {document.uf}</p></Col>
                                </Row>
                            </Col>
                        </Row>
                        <Divider />
                        <p><strong>Data de criação:</strong> {document.createdAt}</p>
                    </Card>
            ))
        );
    };

    return (
        <>
            <PageHeader />

            <Layout className='contentLayout'>
                <h3 className='solicitation-title-text'>Pedido #1</h3>

                <Card
                    className='card-layout'
                    style={{ marginTop: '24px' }}
                >
                    <Spin spinning={isSendingData}>
                        <div className='lead-title'>
                            <h4 className='lead-title-text'>Lead: Documento para criar contrato</h4>
                            <Tag
                                className='tag-status'
                                color='default'
                                icon={
                                    <CheckCircleOutlined
                                        style={{
                                            color: statusSolicitation === EStatusSolicitation.PENDING ? '#FFAF3E' : '#00B98E',
                                            backgroundColor: statusSolicitation === EStatusSolicitation.PENDING ? '#FFAF3E' : '#00B98E'
                                        }}
                                    />
                                }
                            >
                                {
                                    statusSolicitation === EStatusSolicitation.PENDING ?
                                        'Em andamento'
                                    :
                                        'Finalizado'
                                }
                            </Tag>
                        </div>

                        <p>
                            <strong>Observação:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sollicitudin commodo faucibus. Nullam ut pharetra turpis. 
                            Vestibulum molestie turpis ac tortor dapibus porttitor. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. 
                            Etiam in elit vitae ligula consectetur hendrerit id id odio. Vestibulum volutpat gravida arcu sit amet tempus. In rhoncus leo vel dolor convallis gravida id a nulla.
                        </p>

                        <Row gutter={24} style={{ marginTop: '16px' }}>
                            <Col span={6}>
                                {
                                    lastApplicant &&
                                        <p><strong>Criado por:</strong> {lastApplicant}</p>
                                }
                            </Col>

                            <Col span={6}>
                                {
                                    lastDateApplicant &&
                                        <p><strong>Data de criação:</strong> {lastDateApplicant}</p>
                                }
                            </Col>
                        </Row>
                    </Spin>
                </Card>

                <Row gutter={24}>
                    <Col lg={10} md={24} sm={24}>
                        <Card
                            className='card-layout'
                            title='Adicionar documentos ao pedido'
                        >   
                            <Spin spinning={isLoading || isSendingData}>
                                <Form layout='vertical' form={form}>
                                    <Form.Item
                                        name='documentName'
                                        className='required-label'
                                        label='Nome do documento: '
                                        rules={[{
                                            required: true,
                                            message: 'Campo obrigatório' 
                                        }]}
                                    >
                                        <Input className='form-input' name='documentName' placeholder='Digite aqui' value={formData.documentName} onChange={(e: any) => updateFormData('documentName', e)} />
                                    </Form.Item>
                                    <Form.Item
                                        name='peopleType'
                                        className='required-label'
                                        label='Tipo de pessoa: '
                                        rules={[{
                                            required: true,
                                            message: 'Campo obrigatório' 
                                        }]}
                                    >
                                        <Select
                                            showSearch
                                            className='form-select'
                                            size='large'
                                            placeholder='Selecione um tipo de pessoa'
                                            optionFilterProp='children'
                                            value={formData.peopleType}
                                            onChange={(value: number) => updateSelect('peopleType', value)}
                                            filterOption={(input: any, option: any) =>
                                                (option.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            <Select.Option key={1} value={EPeopleType.PHYSICAL_PEOPLE}>Pessoa Física</Select.Option>
                                            <Select.Option key={2} value={EPeopleType.LEGAL_PEOPLE}>Pessoa Jurídica</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    {   
                                        formData.peopleType === EPeopleType.PHYSICAL_PEOPLE ?
                                            <>
                                                <Form.Item
                                                    name='cpf'
                                                    className='required-label'
                                                    label='CPF: '
                                                    rules={[{
                                                            required: formData.peopleType === EPeopleType.PHYSICAL_PEOPLE,
                                                            message: 'Campo obrigatório'
                                                        }]}
                                                >
                                                    <MaskedInput
                                                        className='form-input'
                                                        value={formData.cpf}
                                                        onChange={(e: any) => updateFormData('cpf', e)}
                                                        mask="999.999.999-99"
                                                        placeholder='Digite aqui'
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name='name'
                                                    className='required-label'
                                                    label='Nome completo: '
                                                    rules={[{
                                                        required: formData.peopleType === EPeopleType.PHYSICAL_PEOPLE,
                                                        message: 'Campo obrigatório' 
                                                    }]}
                                                >
                                                    <Input className='form-input' placeholder='Digite aqui' value={formData.name} onChange={(e: any) => updateFormData('name', e)} />
                                                </Form.Item>
                                            </>
                                        :
                                            <>
                                                <Form.Item
                                                    name='cnpj'
                                                    className='required-label'
                                                    label='CNPJ: '
                                                    rules={[{
                                                            required: formData.peopleType === EPeopleType.LEGAL_PEOPLE,
                                                            message: 'Campo obrigatório'
                                                        }]}
                                                >
                                                    <MaskedInput
                                                        className='form-input'
                                                        value={formData.cnpj}
                                                        onChange={(e: any) => updateFormData('cnpj', e)}
                                                        mask="99.999.999/9999-99"
                                                        placeholder='Digite aqui'
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name='corporate-name'
                                                    className='required-label'
                                                    label='Razão social: '
                                                    rules={[{
                                                        required: formData.peopleType === EPeopleType.LEGAL_PEOPLE,
                                                        message: 'Campo obrigatório' 
                                                    }]}
                                                >
                                                    <Input className='form-input' placeholder='Digite aqui' value={formData.corporateName} onChange={(e: any) => updateFormData('corporateName', e)} />
                                                </Form.Item>
                                            </>
                                    }

                                    <p className='resgitry-data-text'>Dados do cartório</p>

                                    <Form.Item
                                        name='cep'
                                        className='required-label'
                                        label='CEP: '
                                        rules={[{
                                            required: true,
                                            message: 'Campo obrigatório' 
                                        }]}
                                    >
                                        <MaskedInput
                                            className='form-input'
                                            value={formData.cep}
                                            mask="99999-999"
                                            placeholder='Digite aqui'
                                            onChange={(e: any) => updateFormData('cep', e)}
                                            onBlur={setAddressData}
                                        />
                                    </Form.Item>
                                    <Row gutter={24}>
                                        <Col xl={16} lg={12} md={16} sm={12} xs={24}>
                                            <Form.Item
                                                name='street'
                                                className='required-label'
                                                label='Rua: '
                                                rules={[{
                                                    required: true,
                                                    message: 'Campo obrigatório' 
                                                }]}
                                            >
                                                <Input className='form-input' placeholder='Digite aqui' value={formData.street} onChange={(e: any) => updateFormData('street', e)} />
                                            </Form.Item>
                                        </Col>
                                        <Col xl={8} lg={12} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                name='streetNumber'
                                                className='required-label'
                                                label='Número: '
                                                rules={[{
                                                    required: true,
                                                    message: 'Campo obrigatório' 
                                                }]}
                                            >
                                                <Input className='form-input' placeholder='Digite aqui' value={formData.streetNumber} onChange={(e: any) => updateFormData('streetNumber', e)} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col xl={16} lg={12} md={16} sm={12} xs={24}>
                                            <Form.Item
                                                name='city'
                                                className='required-label'
                                                label='Cidade: '
                                                rules={[{
                                                    required: true,
                                                    message: 'Campo obrigatório' 
                                                }]}
                                            >
                                                <Input className='form-input' placeholder='Digite aqui' value={formData.city} onChange={(e: any) => updateFormData('city', e)} />
                                            </Form.Item>
                                        </Col>
                                        <Col xl={8} lg={12} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                name='uf'
                                                className='required-label'
                                                label='UF: '
                                                rules={[{
                                                    required: true,
                                                    message: 'Campo obrigatório' 
                                                }]}
                                            >
                                                <Input className='form-input' placeholder='Digite aqui' value={formData.uf} onChange={(e: any) => updateFormData('uf', e)} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Button htmlType={'submit'} className='save-document-button' onClick={sendData}>
                                        Criar documento
                                    </Button>
                                </Form>
                            </Spin>
                        </Card>
                    </Col>

                    <Col lg={14} md={24} sm={24}>
                        <Spin spinning={isSendingData}>
                            {
                                documents.length <= 0 ?
                                    <Card
                                        className='card-layout'
                                    >
                                        <div className='empty-document'>
                                            <img src={EmptyDocumentIcon} />
                                            <p>Nenhum documento criado</p>
                                        </div>
                                    </Card>
                                :
                                    <>
                                        <p className='number-solicitations'><strong>{`${documents.length} ${documents.length === 1 ? 'documento solicitado' : 'documentos solicitados'}`}</strong></p>
                                        {renderDocuments()}
                                    </>
                            }
                            <Pagination
                                pageSize={PAGE_SIZE}
                                current={pagination.current}
                                total={documents.length}
                                onChange={handlePaginationChange}
                                style={{ bottom: "0px" }}
                            />
                        </Spin>
                    </Col>
                </Row>

                <Modal
                    visible={visibleModal}
                    onCancel={() => setVisibleModal(false)}
                    footer={[
                        <Button className='modal-button cancel-button' type='primary' onClick={() =>  setVisibleModal(false)}>
                            Cancelar
                        </Button>,
                        <Button className='modal-button delete-button' type='primary' onClick={() =>  deleteDocument(documentId)}>
                            Excluir
                        </Button>
                    ]}
                >
                    <p className='title-modal'><strong>Confirmar exclusão</strong></p>
                    Tem certeza que desja excluir este documento?
                </Modal>
            </Layout>
            <PageFooter />
        </>
    );
};

export default RequestDocument;