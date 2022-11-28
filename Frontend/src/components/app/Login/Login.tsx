import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';
import { NavLink } from 'react-router-dom';
import { Alert, Button, Card, Form, FormGroup, Input, Label, Row } from 'reactstrap';

import IntlMessages from '../../../helpers/IntlMessages';
import * as loginActions from '../../../stores/actions/LoginActions';
import { Colxx } from '../../common/CustomBootstrap';
import { Loader } from '../../common/Loader';

const Login = (props: any) => {
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  let navigate = useNavigate();

  useEffect(() => {
    setLoading(false);
    if (props.loginReducer.userId?.length > 0) {
      navigate('/home');
    } else {
      props.resetApp();
    }
  }, [props.loginReducer.userId]);

  const onSubmit = (e: any) => {
    setLoading(true);
    e.preventDefault();
    props
      .login({
        username: getValues('username'),
        password: getValues('password'),
      })
      .then(
        () => {
          setLoading(false);
        },
        () => {
          setLoading(false);
        },
      );
  };

  const { ref: usernameRef, ...usernameRest } = register('username', {
    required: true,
    value: props?.data?.id ? props?.data?.username : '',
  });
  const { ref: passwordRef, ...passwordRest } = register('password', {
    required: true,
    value: props?.data?.id ? props?.data?.password : '',
  });

  return (
    <>
      <div className="fixed-background" />
      <main>
        <div className="container">
          <Row className="h-100">
            <Colxx xxs="12" sm="12" md="3" lg="3" className="mx-auto mt-5 center-flex">
              <Card className="auth-card w-330">
                <div className="form-side text-center">
                  <NavLink to="/" className="white mt-3">
                  </NavLink>
                  {props.errors?.length > 0 && (
                    <Alert color="danger" className="rounded">
                      <IntlMessages id="alert.danger-text" />
                    </Alert>
                  )}
                  <Form
                    onSubmit={handleSubmit(onSubmit)}
                    className="av-tooltip tooltip-label-bottom mt-5"
                  >
                    <FormGroup className="form-group has-float-label">
                      <Label>
                        <IntlMessages id="user.username" />
                      </Label>
                      <Input {...usernameRest} innerRef={usernameRef} className="form-control" />
                      {errors?.email && (
                        <div className="invalid-feedback d-block">{errors?.username}</div>
                      )}
                    </FormGroup>
                    <FormGroup className="form-group has-float-label">
                      <Label>
                        <IntlMessages id="user.password" />
                      </Label>
                      <Input
                        type="password"
                        {...passwordRest}
                        innerRef={passwordRef}
                        className="form-control"
                      />
                      {errors?.password && (
                        <div className="invalid-feedback d-block">{errors?.password}</div>
                      )}
                    </FormGroup>
                    <div className="d-flex justify-content-center flex-column align-items-center">
                      {loading ? <Loader size={50} /> : ''}
                      <Button
                        color="primary"
                        className={`mb-5 mt-5 btn-login btn-shadow btn-multiple-state ${props.loading ? 'show-spinner' : ''
                          }`}
                        size="lg"
                        type="submit"
                        onClick={onSubmit}
                      >
                        <span className="spinner d-inline-block">
                          <span className="bounce1" />
                          <span className="bounce2" />
                          <span className="bounce3" />
                        </span>
                        <span className="label">
                          <IntlMessages id="user.login-button" />
                        </span>
                      </Button>
                    </div>
                  </Form>
                </div>
                <div className="divisor"></div>
              </Card>
            </Colxx>
          </Row>
        </div>
      </main>
    </>
  );
};

const mapDispatchToProps = {
  ...loginActions,
};

const mapStateToProps = ({ loginReducer, translateReducer }: any) => {
  return { loginReducer, translateReducer };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
