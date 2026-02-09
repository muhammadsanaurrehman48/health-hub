import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import api from '@/utils/api';
import {
  UserPlus,
  Save,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Users,
  FileText,
} from 'lucide-react';

interface FamilyMember {
  name: string;
  relation: string;
  age: string;
  gender: string;
}

const PatientRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Patient Type and Force Info
  const [patientType, setPatientType] = useState<'ASF' | 'ASF_FAMILY' | 'CIVILIAN'>('CIVILIAN');
  const [forceNo, setForceNo] = useState('');
  
  // Patient Basic Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [cnic, setCnic] = useState('');

  // Contact Info
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  // Family Members
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Medical Info
  const [allergies, setAllergies] = useState('');
  const [existingConditions, setExistingConditions] = useState('');

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: '', relation: '', age: '', gender: '' }]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!firstName || !lastName || !phone || !address || !city) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Validate Force No for ASF types
      if ((patientType === 'ASF' || patientType === 'ASF_FAMILY') && !forceNo) {
        toast.error('Force No is required for ASF patients');
        setIsLoading(false);
        return;
      }

      const patientData = {
        patientType,
        forceNo: patientType !== 'CIVILIAN' ? forceNo : undefined,
        firstName,
        lastName,
        gender,
        dateOfBirth,
        bloodGroup,
        cnic,
        phone,
        email,
        address,
        city,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relation: emergencyRelation,
        },
        allergies,
        existingConditions,
        familyMembers,
      };

      const response = await api.createPatient(patientData);

      if (response.success) {
        toast.success('Patient registered successfully!', {
          description: `${response.data.patientNo} - ${firstName} ${lastName}`,
        });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Patient Registration</h2>
          <p className="text-muted-foreground">Register a new patient in the system</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Type Selection */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Patient Type
            </CardTitle>
            <CardDescription>Select the type of patient</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientType">Patient Type *</Label>
                <Select value={patientType} onValueChange={(value: any) => setPatientType(value)} required>
                  <SelectTrigger id="patientType">
                    <SelectValue placeholder="Select Patient Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASF">ASF (Armed Services)</SelectItem>
                    <SelectItem value="ASF_FAMILY">ASF Family</SelectItem>
                    <SelectItem value="CIVILIAN">Civilian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Force No - Only for ASF and ASF_FAMILY */}
              {(patientType === 'ASF' || patientType === 'ASF_FAMILY') && (
                <div className="space-y-2">
                  <Label htmlFor="forceNo">Force No *</Label>
                  <Input
                    id="forceNo"
                    placeholder="Enter Force Number"
                    value={forceNo}
                    onChange={(e) => setForceNo(e.target.value)}
                    required={patientType !== 'CIVILIAN'}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>Patient's personal details</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC</Label>
              <Input
                id="cnic"
                placeholder="XXXXX-XXXXXXX-X"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger id="bloodGroup">
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Contact Information
            </CardTitle>
            <CardDescription>How to reach the patient</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="03XX-XXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="patient@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Emergency Contact
            </CardTitle>
            <CardDescription>Person to contact in case of emergency</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Contact Name *</Label>
              <Input
                id="emergencyName"
                placeholder="Full Name"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Contact Phone *</Label>
              <Input
                id="emergencyPhone"
                placeholder="03XX-XXXXXXX"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyRelation">Relationship *</Label>
              <Select value={emergencyRelation} onValueChange={setEmergencyRelation} required>
                <SelectTrigger id="emergencyRelation">
                  <SelectValue placeholder="Select Relation" />
                </SelectTrigger>
                <SelectContent>
                  {['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'].map((rel) => (
                    <SelectItem key={rel} value={rel.toLowerCase()}>
                      {rel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Family Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Family Members
                </CardTitle>
                <CardDescription>Add dependent family members</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addFamilyMember}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {familyMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No family members added yet
              </p>
            ) : (
              <div className="space-y-4">
                {familyMembers.map((member, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-muted/30 rounded-lg"
                  >
                    <Input
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                    />
                    <Select
                      value={member.relation}
                      onValueChange={(v) => updateFamilyMember(index, 'relation', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Relation" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Spouse', 'Son', 'Daughter', 'Parent', 'Sibling'].map((rel) => (
                          <SelectItem key={rel} value={rel.toLowerCase()}>
                            {rel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Age"
                      type="number"
                      value={member.age}
                      onChange={(e) => updateFamilyMember(index, 'age', e.target.value)}
                    />
                    <Select
                      value={member.gender}
                      onValueChange={(v) => updateFamilyMember(index, 'gender', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeFamilyMember(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Medical Information
            </CardTitle>
            <CardDescription>Known medical conditions and allergies</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allergies">Known Allergies</Label>
              <Textarea
                id="allergies"
                placeholder="List any known allergies..."
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conditions">Existing Conditions</Label>
              <Textarea
                id="conditions"
                placeholder="List any existing medical conditions..."
                value={existingConditions}
                onChange={(e) => setExistingConditions(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
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
