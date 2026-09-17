import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserDetails from './UserDetails';
import EditUserModal from '../../components/modals/EditUserModal';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/administration/users/${id}`);
  };

  return (
    <div className="relative">
      <UserDetails />
      <EditUserModal
        isOpen={true}
        onClose={handleClose}
        userId={id}
        onUserUpdated={() => handleClose()}
      />
    </div>
  );
};

export default EditUser;
