import InputGroup from "./InputGroup";

export default function TabSMTP({ formData, handleChange }) {
  return (
    <div className='space-y-6 animate-in fade-in duration-300'>
      <div className='grid md:grid-cols-2 gap-6'>
        <InputGroup
          label='SMTP Host'
          name='smtpHost'
          value={formData.smtpHost}
          onChange={handleChange}
          placeholder='smtp.gmail.com'
        />
        <InputGroup
          label='SMTP Port'
          name='smtpPort'
          value={formData.smtpPort}
          onChange={handleChange}
          placeholder='587'
        />
        <InputGroup
          label='SMTP User'
          name='smtpUser'
          value={formData.smtpUser}
          onChange={handleChange}
          placeholder='email@gmail.com'
        />
        <InputGroup
          label='SMTP Password'
          name='smtpPassword'
          value={formData.smtpPassword}
          onChange={handleChange}
          type='password'
          placeholder='••••••••'
        />
        <InputGroup
          label='Sender Email (From)'
          name='smtpFromEmail'
          value={formData.smtpFromEmail}
          onChange={handleChange}
          placeholder='no-reply@domain.com'
        />
        <InputGroup
          label='Sender Name'
          name='smtpFromName'
          value={formData.smtpFromName}
          onChange={handleChange}
          placeholder='Admin Course'
        />
      </div>
    </div>
  );
}
