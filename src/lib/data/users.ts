export type SampleUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  joinedOn: string;
  ordersCount: number;
  totalSpend: number;
  lastOrderDate?: string;
};

export const sampleUsers: SampleUser[] = [
  {
    id: "demo-user-1",
    fullName: "Nadia Rahman",
    email: "nadia.rahman@example.com",
    phone: "+8801712345678",
    joinedOn: "2023-03-18T10:30:00+06:00",
    ordersCount: 8,
    totalSpend: 1260,
    lastOrderDate: "2024-09-21T10:30:00+06:00",
  },
  {
    id: "demo-user-2",
    fullName: "Arman Hossain",
    email: "arman.hossain@example.com",
    phone: "+8801911223344",
    joinedOn: "2022-11-04T08:15:00+06:00",
    ordersCount: 12,
    totalSpend: 1845,
    lastOrderDate: "2024-08-17T16:40:00+06:00",
  },
  {
    id: "demo-user-3",
    fullName: "Farhana Sultana",
    email: "farhana.sultana@example.com",
    phone: "+8801311122233",
    joinedOn: "2023-07-26T12:20:00+06:00",
    ordersCount: 5,
    totalSpend: 760,
    lastOrderDate: "2024-07-02T09:50:00+06:00",
  },
  {
    id: "demo-user-4",
    fullName: "Mahmud Hasan",
    email: "mahmud.hasan@example.com",
    phone: "+8801719988776",
    joinedOn: "2024-01-12T14:05:00+06:00",
    ordersCount: 3,
    totalSpend: 430,
    lastOrderDate: "2024-09-03T11:10:00+06:00",
  },
  {
    id: "demo-user-5",
    fullName: "Sadia Chowdhury",
    email: "sadia.chowdhury@example.com",
    phone: "+8801955667788",
    joinedOn: "2023-05-08T17:45:00+06:00",
    ordersCount: 10,
    totalSpend: 1525,
    lastOrderDate: "2024-08-29T15:25:00+06:00",
  },
  {
    id: "demo-user-6",
    fullName: "Jahirul Karim",
    email: "jahirul.karim@example.com",
    phone: "+8801712456987",
    joinedOn: "2022-09-30T09:00:00+06:00",
    ordersCount: 15,
    totalSpend: 2380,
    lastOrderDate: "2024-07-21T18:00:00+06:00",
  },
];
