import request from '@/utils/request'

const api_name = '/admin/dep/dep_belong'


/*
获取后台科室医生分页列表(带搜索)
*/
export function getPageList(page, limit, searchObj) {
  return request({
    url: `${api_name}/${page}/${limit}`,
    method: 'get',
    params: searchObj
  })
}

/*
根据ID获取某个后台科室医生
*/
export function getById(id) {
  return request({
    url: `${api_name}/get/${id}`,
    method: 'get'
  })
}

/*
保存一个新的后台科室医生
*/
export function add(depbelong) {
  return request({
    url: `${api_name}/save`,
    method: 'post',
    data: depbelong
  })
}

/*
更新一个后台科室医生
*/
export function update(depbelong) {
  return request({
    url: `${api_name}/update`,
    method: 'put',
    data: depbelong
  })
}


/*
删除某个科室医生
*/
export function removeById(id) {
  return request({
    url: `${api_name}/remove/${id}`,
    method: 'delete'
  })
}

/*
批量删除多个科室医生
ids的结构: ids是包含n个id的数组
*/
export function removedepbelongs(ids) {
  return request({
    url: `${api_name}/batchRemove`,
    method: 'delete',
    data: ids
  })
}
