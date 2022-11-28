import React, { Suspense, useLayoutEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ColorSwitcher from '../components/common/ColorSwitcher';
import Layout from '../components/common/layout/Layout';
import { NotificationContainer } from '../components/common/Notifications';
import { isMultiColorActive } from '../constants/defaultValues';
import AppLocale from '../lang';
import * as LoginActions from '../stores/actions/LoginActions';

const Login = React.lazy(() => {
  return import(/* webpackChunkName: "Login" */ '../components/app/Login/Login');
});

const Home = React.lazy(() => {
  return import(/* webpackChunkName: "Home" */ '../components/Home');
});

const Profile = React.lazy(() => {
  return import(/* webpackChunkName: "Profile" */ '../components/app/Profile/Profile');
});

const MenuList = React.lazy(() => {
  return import(/* webpackChunkName: "MenuList" */ '../components/app/Menu/MenuList');
});

const SubmenuList = React.lazy(() => {
  return import(/* webpackChunkName: "SubmenuList" */ '../components/app/Submenu/SubmenuList');
});

const ModuleList = React.lazy(() => {
  return import(/* webpackChunkName: "ModuleList" */ '../components/app/Module/ModuleList');
});

const RoleList = React.lazy(() => {
  return import(/* webpackChunkName: "RoleList" */ '../components/app/Role/RoleList');
});

const UserList = React.lazy(() => {
  return import(/* webpackChunkName: "UserList" */ '../components/app/User/UserList');
});

const App = (props: any) => {
  const { locale } = props.translateReducer;

  const currentAppLocale = AppLocale[locale];

  const [permissions, setPermissions] = useState(false);

  useLayoutEffect(() => {
    const token = localStorage.getItem('token');
    if (props?.loginReducer?.userId?.length > 0 && token != null) {
      setPermissions(true);
    } else {
      setPermissions(false);
    }
  }, [props.loginReducer]);

  return (
    <div className="h-100">
      <IntlProvider locale={currentAppLocale.locale} messages={currentAppLocale.messages}>
        <NotificationContainer />
        {isMultiColorActive && <ColorSwitcher />}
        <BrowserRouter>
          <Layout permissions={permissions}>
            <Suspense fallback={<div className="loading" />}>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={permissions ? <Home /> : <Login />} />
                {permissions ? (
                  <>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/roles" element={<RoleList />} />
                    <Route path="/users" element={<UserList />} />
                    <Route path="/modules" element={<ModuleList />} />
                    <Route path="/menus" element={<MenuList />} />
                    <Route path="/submenus" element={<SubmenuList />} />
                  </>
                ) : (
                  <Route path="*" element={<Login />} />
                )}
                <Route element={<Home />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </IntlProvider>
    </div>
  );
};

const mapDispatchToProps = { ...LoginActions };

const mapStateToProps = ({ loginReducer, translateReducer }: any) => {
  return { loginReducer, translateReducer };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
