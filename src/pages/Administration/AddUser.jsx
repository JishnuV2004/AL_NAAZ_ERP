import React from 'react';
import { useNavigate } from 'react-router-dom';
import Users from './Users';
import AddUserModal from '../../components/modals/AddUserModal';

const AddUser = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/administration/users');
  };

  return (
    <div className="relative">
      <Users />
      <AddUserModal
        isOpen={true}
        onClose={handleClose}
        onUserCreated={() => {}}
      />
    </div>
  );
};

export default AddUser;

