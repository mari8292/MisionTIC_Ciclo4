import { gql } from '@apollo/client';

export const MUTATION_LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    data: login(username: $username, password: $password) {
      jwt
      name
      lastName
      profilePhoto
      userId
      role {
        id
        name
      }
      roleMenus {
        id
        name
        icon
        menuItemsLogin {
          id
          name
          icon
          isHidden
          createAction
          deleteAction
          updateAction
          readAction
          fullAccess
          activateAction
          inactiveAction
          module {
            url
          }
        }
      }
    }
  }
`;

export const QUERY_ME = gql`
  query {
    me {
      name
      lastName
      profilePhoto
      userId      
      role {
        id
        name
      }
      roleMenus {
        id
        name
        icon
        menuItemsLogin {
          id
          name
          icon
          isHidden
          createAction
          deleteAction
          updateAction
          readAction
          fullAccess
          activateAction
          inactiveAction
          module {
            url
          }
        }
      }
    }
  }
`;
