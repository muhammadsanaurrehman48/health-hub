import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/utils/api';
import { Save, Shield, Phone, User, X } from 'lucide-react';

const unitOptions = ['JIAP', 'NAAS', 'HQs ASF', 'ASF Academy', 'Other'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

type PatientType = 'ASF' | 'ASF_FAMILY' | 'CIVILIAN';

const PatientRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [patientType, setPatientType] = useState<PatientType>('ASF');
  const [name, setName] = useState('');
  const [forceNo, setForceNo] = useState('');
  const [cnic, setCnic] = useState('');
  const [unit, setUnit] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [rank, setRank] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isCivilian = patientType === 'CIVILIAN';
      const isAsf = patientType === 'ASF' || patientType === 'ASF_FAMILY';

      if (
        !name.trim() ||
        !cnic.trim() ||
        !phone.trim() ||
        !dateOfBirth ||
        !bloodGroup ||
        (isAsf && (!forceNo.trim() || !unit.trim() || !rank.trim())) ||
        (isCivilian && !address.trim())
      ) {
        toast.error('Please fill in all required fields for the selected patient type');
        setIsLoading(false);
        return;
      }

      const [firstNamePart, ...restNames] = name.trim().split(/\s+/);
      const derivedLastName = restNames.join(' ');

      const patientData = {
        patientType,
        name: name.trim(),
        firstName: firstNamePart,
        lastName: derivedLastName,
        forceNo: isAsf ? forceNo.trim() : undefined,
        unit: isAsf ? unit.trim() : undefined,
        rank: isAsf ? rank.trim() : undefined,
        cnic: cnic.trim(),
        phone: phone.trim(),
        contactNo: phone.trim(),
        dateOfBirth,
        bloodGroup,
        address: isCivilian ? address.trim() : undefined,
      };

      const response = await api.createPatient(patientData);

      if (response.success) {
        toast.success('Patient registered successfully!', {
          description: `${response.data?.patientNo ? response.data.patientNo + ' - ' : ''}${name.trim()}`,
        });
        sessionStorage.setItem('refreshPatients', 'true');
        navigate('/receptionist/patients/search');
      } else {
        toast.error(response.message || 'Failed to register patient');
      }
    } catch (err) {
      console.error('Error registering patient:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to register patient');
    } finally {
      setIsLoading(false);
    }
  };

  const isAsf = patientType === 'ASF' || patientType === 'ASF_FAMILY';
  const isCivilian = patientType === 'CIVILIAN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Patient Registration</h2>
          <p className="text-muted-foreground">Capture only the fields needed for quick enrollment</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Patient Type
            </CardTitle>
            <CardDescription>Select the category to align required fields</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientType">Patient Type *</Label>
              <Select value={patientType} onValueChange={(value: PatientType) => setPatientType(value)} required>
                <SelectTrigger id="patientType">
                  <SelectValue placeholder="Select Patient Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASF">ASF Staff</SelectItem>
                  <SelectItem value="ASF_FAMILY">ASF Family</SelectItem>
                  <SelectItem value="CIVILIAN">Civilian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isAsf && (
              <div className="space-y-2">
                <Label htmlFor="forceNo">Force No *</Label>
                <Input
                  id="forceNo"
                  placeholder="Enter Force Number"
                  value={forceNo}
                  onChange={(e) => setForceNo(e.target.value)}
                  required
                />
              </div>
            )}

            {isAsf && (
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={unit} onValueChange={setUnit} required>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isAsf && (
              <div className="space-y-2">
                <Label htmlFor="rank">Rank *</Label>
                <Input
                  id="rank"
                  placeholder="e.g. Corporal"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  required
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Patient Details
            </CardTitle>
            <CardDescription>Essentials for identity and safety</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2 lg:col-span-3">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC *</Label>
              <Input
                id="cnic"
                placeholder="XXXXX-XXXXXXX-X"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group *</Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup} required>
                <SelectTrigger id="bloodGroup">
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Contact
            </CardTitle>
            <CardDescription>Reach-out details based on patient category</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Contact No *</Label>
              <Input
                id="phone"
                placeholder="03XX-XXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address {isCivilian ? '*' : '(optional for ASF)'}</Label>
              <Textarea
                id="address"
                placeholder="House / Street / City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required={isCivilian}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Registering...' : 'Register Patient'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistrationForm;
