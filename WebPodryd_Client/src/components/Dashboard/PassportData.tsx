// src/components/Dashboard/PassportData.tsx
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FirstPage, LastPage } from '@mui/icons-material';
import { useState } from 'react';

const PassportData = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Тестовые данные
  const passportData = [
    {
      id: 1,
      name: "Староверов Николай Сергеевич",
      documentType: "паспорт РБ",
      documentNumber: "ВМ2669198",
      issueDate: "24.12.2019",
      expiryDate: "24.12.2029",
      issuedBy: "Березовский РОВД, Брестской области",
      idNumber: "32412935023РВ1",
      registration: "Брестская область г. Берёза ул. Мариненко, д.4",
      insuranceNumber: "32412935023РВ1",
      birthDate: "24.12.1993",
      phone: "375336795665"
    },
    {
      id: 2,
      name: "Кравцова Надежда Валерьевна",
      documentType: "вид на жительство",
      documentNumber: "P10095474",
      issueDate: "10.06.2016",
      expiryDate: "10.06.2055",
      issuedBy: "Центральный РОВД, г. Бреста",
      idNumber: "7168384А00РВ4",
      registration: "г. Брест, ул. Слободская, д. 50",
      insuranceNumber: "7168384А00РВ4",
      birthDate: "16.03.1984",
      phone: "375333879376"
    },
    {
      id: 3,
      name: "Демидов Евгений Русланович",
      documentType: "паспорт РБ",
      documentNumber: "ВМ2299692",
      issueDate: "15.06.2015",
      expiryDate: "15.06.2025",
      issuedBy: "Барановичский РОВД, Брестской области",
      idNumber: "4180282Е02Э9РВ2",
      registration: "Брестская область г. Барановичи ул. Калинина",
      insuranceNumber: "4180282Е02Э9РВ2",
      birthDate: "18.02.1982",
      phone: "375295973422"
    },
    {
      id: 4,
      name: "Меркуль Олег Александрович",
      documentType: "паспорт РБ",
      documentNumber: "ВМ1726105",
      issueDate: "02.06.2009",
      expiryDate: "07.05.2029",
      issuedBy: "Дрогичинский РОВД, Брестской области",
      idNumber: "4070584Е03ОРВ1",
      registration: "Брестская область г. Дрогичин ул. Гая, д. 15 кв. 7",
      insuranceNumber: "4070584Е03ОРВ1",
      birthDate: "07.05.1984",
      phone: "375296027140"
    },
    {
      id: 5,
      name: "Молчанов Валерий Николаевич",
      documentType: "паспорт РБ",
      documentNumber: "ВМ2381059",
      issueDate: "01.07.2016",
      expiryDate: "01.07.2026",
      issuedBy: "Кобринский РОВД, Брестской области",
      idNumber: "3031198Е00ВРВ7",
      registration: "Брестская область г. Кобрин, ул. Советская, д.50",
      insuranceNumber: "3031198Е00ВРВ7",
      birthDate: "03.11.1998",
      phone: "375297692855"
    }
  ];

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Паспортные данные подрядчиков</Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Назад
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3, overflowX: 'auto' }}>
        <Table sx={{
          borderCollapse: 'collapse',
          '& th, & td': {
            borderRight: '1px solid rgba(224, 224, 224, 1)',
            '&:last-child': {
              borderRight: 'none'
            }
          }
        }}>
          <TableHead>
            <TableRow sx={{
              backgroundColor: '#f5f5f5',
              '& th': {
                fontWeight: 'bold',
                borderBottom: '2px solid rgba(224, 224, 224, 1)'
              }
            }}>
              <TableCell>ФИО</TableCell>
              <TableCell>Вид документа</TableCell>
              <TableCell>Серия и номер</TableCell>
              <TableCell>Дата выдачи</TableCell>
              <TableCell>Срок действия</TableCell>
              <TableCell>Орган, выдавший документ</TableCell>
              <TableCell>Идентификационный номер</TableCell>
              <TableCell>Место регистрации</TableCell>
              <TableCell>Номер страхового свидетельства</TableCell>
              <TableCell>Дата рождения</TableCell>
              <TableCell>Мобильный телефон</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {passportData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((data) => (
                <TableRow
                  key={data.id}
                  hover
                  sx={{
                    '&:nth-of-type(even)': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    },
                    '& td': {
                      borderBottom: '1px solid rgba(224, 224, 224, 1)'
                    }
                  }}
                >
                  <TableCell>{data.name}</TableCell>
                  <TableCell>{data.documentType}</TableCell>
                  <TableCell>{data.documentNumber}</TableCell>
                  <TableCell>{data.issueDate}</TableCell>
                  <TableCell>{data.expiryDate}</TableCell>
                  <TableCell>{data.issuedBy}</TableCell>
                  <TableCell>{data.idNumber}</TableCell>
                  <TableCell>{data.registration}</TableCell>
                  <TableCell>{data.insuranceNumber}</TableCell>
                  <TableCell>{data.birthDate}</TableCell>
                  <TableCell>{data.phone}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Пагинация */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: 2
      }}>
        <IconButton
          onClick={() => handleChangePage(0)}
          disabled={page === 0}
        >
          <FirstPage />
        </IconButton>
        <IconButton
          onClick={() => handleChangePage(page - 1)}
          disabled={page === 0}
        >
          <ChevronLeft />
        </IconButton>
        <Typography variant="body2" sx={{ mx: 2 }}>
          {page + 1} из {Math.ceil(passportData.length / rowsPerPage)}
        </Typography>
        <IconButton
          onClick={() => handleChangePage(page + 1)}
          disabled={page >= Math.ceil(passportData.length / rowsPerPage) - 1}
        >
          <ChevronRight />
        </IconButton>
        <IconButton
          onClick={() => handleChangePage(Math.ceil(passportData.length / rowsPerPage) - 1)}
          disabled={page >= Math.ceil(passportData.length / rowsPerPage) - 1}
        >
          <LastPage />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PassportData;