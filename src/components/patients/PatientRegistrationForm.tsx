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
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];
const relationOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

type PatientType = 'ASF' | 'ASF_FOUNDATION' | 'CIVILIAN';

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
  const [gender, setGender] = useState('');
  const [rank, setRank] = useState('');
  const [address, setAddress] = useState('');
  const emptyFamilyMember = { name: '', gender: '', dateOfBirth: '', bloodGroup: '', relationToHead: '', phone: '', cnic: '' };
  const [familyMembers, setFamilyMembers] = useState([emptyFamilyMember]);

  const isAsfStaffType = patientType === 'ASF';
  const isFoundationType = patientType === 'ASF_FOUNDATION';
  const isCivilianType = patientType === 'CIVILIAN';
  const requiresAddress = isCivilianType || isFoundationType;

  const formatCnic = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 13);
    const part1 = digits.slice(0, 5);
    const part2 = digits.slice(5, 12);
    const part3 = digits.slice(12, 13);
    if (digits.length > 12) return `${part1}-${part2}-${part3}`;
    if (digits.length > 5) return `${part1}-${part2}`;
    return part1;
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    setFamilyMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addFamilyMember = () => {
    setFamilyMembers((prev) => [...prev, emptyFamilyMember]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (
        !name.trim() ||
        !cnic.trim() ||
        !phone.trim() ||
        !gender ||
        !dateOfBirth ||
        !bloodGroup ||
        (isAsfStaffType && (!forceNo.trim() || !unit.trim() || !rank.trim())) ||
        (requiresAddress && !address.trim())
      ) {
        toast.error('Please fill in all required fields for the selected patient type');
        setIsLoading(false);
        return;
      }

      const filteredFamilyMembers = familyMembers.filter((fm) => {
        return fm.name || fm.gender || fm.dateOfBirth || fm.bloodGroup || fm.relationToHead || fm.phone || fm.cnic;
      });

      if (isAsfStaffType) {
        const incomplete = filteredFamilyMembers.some((fm) => !fm.name.trim() || !fm.gender || !fm.dateOfBirth || !fm.bloodGroup || !fm.relationToHead);
        if (incomplete) {
          toast.error('Please complete all required fields for each family member (name, relation, gender, DOB, blood group)');
          setIsLoading(false);
          return;
        }
      }

      const [firstNamePart, ...restNames] = name.trim().split(/\s+/);
      const derivedLastName = restNames.join(' ') || firstNamePart;

      const patientData = {
        patientType,
        name: name.trim(),
        firstName: firstNamePart,
        lastName: derivedLastName,
        forceNo: isAsfStaffType ? forceNo.trim() : undefined,
        unit: isAsfStaffType ? unit.trim() : undefined,
        rank: isAsfStaffType ? rank.trim() : undefined,
        cnic: cnic.trim(),
        phone: phone.trim(),
        contactNo: phone.trim(),
        dateOfBirth,
        bloodGroup,
        gender,
        address: requiresAddress ? address.trim() : undefined,
        familyMembers:
          isAsfStaffType
            ? filteredFamilyMembers.map((fm) => ({
                ...fm,
                name: fm.name.trim(),
              }))
            : undefined,
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

  const isAsfStaff = isAsfStaffType;

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
                  <SelectItem value="ASF_FOUNDATION">ASF Foundation / School</SelectItem>
                  <SelectItem value="CIVILIAN">Civilian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isAsfStaff && (
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

            {isAsfStaff && (
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

            {isAsfStaff && (
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
                onChange={(e) => setCnic(formatCnic(e.target.value))}
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
              <Label htmlFor="gender">Gender *</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="address">Address {requiresAddress ? '*' : '(optional for ASF Staff)'}</Label>
              <Textarea
                id="address"
                placeholder="House / Street / City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required={requiresAddress}
              />
            </div>
          </CardContent>
        </Card>

        {isAsfStaff && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Family Members ( Will have the same Force Number )
              </CardTitle>
              <CardDescription>Add spouse/children so they can be reused on future visits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {familyMembers.map((fm, idx) => (
                <div key={idx} className="border rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-muted-foreground">Family Member {idx + 1}</p>
                    <Button variant="ghost" type="button" size="sm" onClick={() => removeFamilyMember(idx)} disabled={familyMembers.length === 1}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2 lg:col-span-3">
                      <Label htmlFor={`fm-name-${idx}`}>Name</Label>
                      <Input
                        id={`fm-name-${idx}`}
                        placeholder="Full name"
                        value={fm.name}
                        onChange={(e) => updateFamilyMember(idx, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`fm-relation-${idx}`}>Relation</Label>
                      <Select
                        value={fm.relationToHead}
                        onValueChange={(val) => updateFamilyMember(idx, 'relationToHead', val)}
                      >
                        <SelectTrigger id={`fm-relation-${idx}`}>
                          <SelectValue placeholder="Select relation" />
                        </SelectTrigger>
                        <SelectContent>
                          {relationOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`fm-gender-${idx}`}>Gender</Label>
                      <Select value={fm.gender} onValueChange={(val) => updateFamilyMember(idx, 'gender', val)}>
                        <SelectTrigger id={`fm-gender-${idx}`}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((g) => (
                            <SelectItem key={g.value} value={g.value}>
                              {g.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`fm-dob-${idx}`}>Date of Birth</Label>
                      <Input
                        id={`fm-dob-${idx}`}
                        type="date"
                        value={fm.dateOfBirth}
                        onChange={(e) => updateFamilyMember(idx, 'dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`fm-blood-${idx}`}>Blood Group</Label>
                      <Select value={fm.bloodGroup} onValueChange={(val) => updateFamilyMember(idx, 'bloodGroup', val)}>
                        <SelectTrigger id={`fm-blood-${idx}`}>
                          <SelectValue placeholder="Select blood group" />
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
                    <div className="space-y-2">
                      <Label htmlFor={`fm-phone-${idx}`}>Phone (optional)</Label>
                      <Input
                        id={`fm-phone-${idx}`}
                        placeholder="03XX-XXXXXXX"
                        value={fm.phone}
                        onChange={(e) => updateFamilyMember(idx, 'phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`fm-cnic-${idx}`}>CNIC (optional)</Label>
                      <Input
                        id={`fm-cnic-${idx}`}
                        placeholder="XXXXX-XXXXXXX-X"
                        value={fm.cnic}
                        onChange={(e) => updateFamilyMember(idx, 'cnic', formatCnic(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addFamilyMember}>
                Add Family Member
              </Button>
            </CardContent>
          </Card>
        )}

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
