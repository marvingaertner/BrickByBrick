import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD ? '' : 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const uploadAttachment = async (expenseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/expenses/${expenseId}/attachments/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteAttachment = async (attachmentId) => {
    return api.delete(`/attachments/${attachmentId}`);
};

export default api;
